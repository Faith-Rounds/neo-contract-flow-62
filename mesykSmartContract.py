from pyteal import *

# -------- Global keys
G_CLIENT      = Bytes("client")
G_FREELANCER  = Bytes("freelancer")
G_ASSET       = Bytes("assetId")
G_TOTAL       = Bytes("total")
G_PAID        = Bytes("paid")
G_ACCRUED     = Bytes("accrued")
G_START       = Bytes("startTs")
G_END         = Bytes("endTs")
G_CANCELLED   = Bytes("cancelled")
G_SEALED      = Bytes("sealed")
G_SPECHASH    = Bytes("specHash")  # 32B SHA-256 of off-chain spec JSON

# Milestone box layout: amount|submitted|approved|hash(32)|approvedAt
# Keep it simple: fixed layout, encoded with Itob/concat.
def milestone_key(i: Expr) -> Expr:
    return Concat(Bytes("m"), Itob(i))

ZERO = Int(0)

def assert_no_dangerous_fields(tx: TxnObject) -> Expr:
    return Seq(
        Assert(tx.rekey_to() == Global.zero_address()),
        Assert(tx.close_remainder_to() == Global.zero_address()),
        Assert(tx.asset_close_to() == Global.zero_address())
    )

def is_sender(addr: Expr) -> Expr:
    return Txn.sender() == addr

def role_client() -> Expr:
    return is_sender(App.globalGet(G_CLIENT))

def role_freelancer() -> Expr:
    return is_sender(App.globalGet(G_FREELANCER))

def assert_sealed(v: int) -> Expr:
    # v=1 require sealed; v=0 require NOT sealed
    return Assert(App.globalGet(G_SEALED) == Int(v))

# ---------------- Methods

@Subroutine(TealType.none)
def write_milestone(i: Expr, amount: Expr) -> Expr:
    key = ScratchVar(TealType.bytes)
    return Seq(
        key.store(milestone_key(i)),
        # amount|submitted|approved|hash(32)|approvedAt
        App.box_put(key.load(), Concat(Itob(amount), Itob(Int(0)), Itob(Int(0)), BytesZero(32), Itob(Int(0))))
    )

@Subroutine(TealType.none)
def set_milestone_submitted(i: Expr, h: Expr) -> Expr:
    key = ScratchVar(TealType.bytes)
    val = ScratchVar(TealType.bytes)
    amount = ScratchVar(TealType.uint64)
    # decode first 8 bytes as amount; reassemble with submitted=1
    return Seq(
        key.store(milestone_key(i)),
        val.store(App.box_get(key.load()).value()),
        amount.store(Btoi(Extract(val.load(), Int(0), Int(8)))),
        App.box_put(
            key.load(),
            Concat(
                Itob(amount.load()),
                Itob(Int(1)),               # submitted = 1
                Extract(val.load(), Int(16), Int(8+32+8)),  # keep approved/hash/approvedAt placeholders
            )  # we'll re-write hash + keep approvedAt zero for now
        ),
        # now overwrite hash position precisely (amount 8 + submitted 8 + approved 8 = 24)
        App.box_put(key.load(),
            Concat(
                Itob(amount.load()),
                Itob(Int(1)),
                Itob(Int(0)),
                h,                          # 32 bytes hash
                Itob(Int(0))
            )
        )
    )

@Subroutine(TealType.none)
def set_milestone_approved(i: Expr) -> Expr:
    key = ScratchVar(TealType.bytes)
    val = ScratchVar(TealType.bytes)
    amount = ScratchVar(TealType.uint64)
    submitted = ScratchVar(TealType.uint64)
    return Seq(
        key.store(milestone_key(i)),
        val.store(App.box_get(key.load()).value()),
        amount.store(Btoi(Extract(val.load(), Int(0), Int(8)))),
        submitted.store(Btoi(Extract(val.load(), Int(8), Int(8)))),
        Assert(submitted.load() == Int(1)),           # must be submitted first
        # set approved=1 & approvedAt=now
        App.box_put(
            key.load(),
            Concat(
                Itob(amount.load()),
                Itob(Int(1)),
                Itob(Int(1)),
                Extract(val.load(), Int(24), Int(32)),  # keep hash
                Itob(Global.latest_timestamp())
            )
        ),
        # bump accrued
        App.globalPut(G_ACCRUED, App.globalGet(G_ACCRUED) + amount.load())
    )

def approval():
    router = Router(
        name="escrow_agreement_v1",
        descr="Customizable-then-immutable escrow with milestones & withdraw-time payouts",
    )

    # ---- Lifecycle hooks (Update/Delete): disallow when sealed (and preferably always)
    @router.update
    def on_update():
        return Seq(
            # strongest stance: always reject
            Reject()
        )

    @router.delete
    def on_delete():
        return Seq(
            # strongest stance: always reject
            Reject()
        )

    # ---- Configure + Fund (atomic group: axfer + app call), then seal
    @router.method
    def initAndFund(
        client: abi.Address,
        freelancer: abi.Address,
        assetId: abi.Uint64,
        total: abi.Uint64,
        startTs: abi.Uint64,
        endTs: abi.Uint64,
        specHash: abi.DynamicBytes,   # expect 32-byte SHA-256
        milestoneCount: abi.Uint64,
        *, output: abi.Void
    ):
        """
        Grouped with an ASA transfer of `total` units to the application account.
        Creates milestone boxes (zeroed amounts; you may also pass amounts via follow-ups),
        opts-in app to asset if needed, seals the app.
        """
        axfer = Gtxna(Int(0), Txn.group_index() - Int(1))  # previous txn in group (simple pattern)
        app_acct = Global.current_application_address()

        return Seq(
            # Safety on outer txn
            assert_no_dangerous_fields(Txn),

            # Contract should not allow post-seal re-init
            Assert(Or(App.globalGetEx(Global.current_application_id(), G_SEALED).hasValue() == Int(0),
                      App.globalGet(G_SEALED) == Int(0))),

            # Validate group: previous is asset xfer to app
            Assert(Global.group_size() == Int(2)),
            Assert(axfer.type_enum() == TxnType.AssetTransfer),
            Assert(axfer.xfer_asset() == assetId.get()),
            Assert(axfer.asset_receiver() == app_acct),
            Assert(axfer.asset_amount() == total.get()),

            # Set globals
            App.globalPut(G_CLIENT, client.get()),
            App.globalPut(G_FREELANCER, freelancer.get()),
            App.globalPut(G_ASSET, assetId.get()),
            App.globalPut(G_TOTAL, total.get()),
            App.globalPut(G_PAID, Int(0)),
            App.globalPut(G_ACCRUED, Int(0)),
            App.globalPut(G_START, startTs.get()),
            App.globalPut(G_END, endTs.get()),
            App.globalPut(G_CANCELLED, Int(0)),

            # spec hash must be 32B
            Assert(Len(specHash.get()) == Int(32)),
            App.globalPut(G_SPECHASH, specHash.get()),

            # Opt-in app to asset if not holding yet (inner txn)
            If(App.param().asset_holding_get(app_acct, assetId.get()).hasValue() == Int(0)).Then(
                InnerTxnBuilder.Begin(),
                InnerTxnBuilder.SetFields({
                    TxnField.type_enum: TxnType.AssetTransfer,
                    TxnField.xfer_asset: assetId.get(),
                    TxnField.asset_receiver: app_acct,
                    TxnField.asset_amount: Int(0),  # opt-in
                }),
                InnerTxnBuilder.Submit()
            ),

            # Create milestone boxes (amounts can be set later or in a variant that takes a packed array)
            For(i := ScratchVar(TealType.uint64), i.store(Int(0)), i.load() < milestoneCount.get(), i.store(i.load() + Int(1))).Do(
                write_milestone(i.load(), Int(0))
            ),

            # Seal the app (immutability from now on)
            App.globalPut(G_SEALED, Int(1)),
        )

    # Optional: set amount per milestone BEFORE approvals (only by client, must be sealed already so roles fixed)
    @router.method
    def setMilestoneAmount(i: abi.Uint64, amount: abi.Uint64, *, output: abi.Void):
        return Seq(
            assert_sealed(1),
            Assert(role_client()),
            # cannot change amounts once submitted/approved
            (key := ScratchVar(TealType.bytes)).store(milestone_key(i.get())),
            (val := ScratchVar(TealType.bytes)).store(App.box_get(key.load()).value()),
            Assert(Btoi(Extract(val.load(), Int(8), Int(8))) == Int(0)),   # submitted==0
            Assert(Btoi(Extract(val.load(), Int(16), Int(8))) == Int(0)),  # approved==0
            App.box_put(key.load(), Concat(Itob(amount.get()), Extract(val.load(), Int(8), Int(8+32+8))))
        )

    @router.method
    def submitMilestone(i: abi.Uint64, deliverableHash: abi.DynamicBytes, *, output: abi.Void):
        return Seq(
            assert_sealed(1),
            Assert(role_freelancer()),
            Assert(Len(deliverableHash.get()) == Int(32)),
            set_milestone_submitted(i.get(), deliverableHash.get())
        )

    @router.method
    def approveMilestone(i: abi.Uint64, *, output: abi.Void):
        return Seq(
            assert_sealed(1),
            Assert(role_client()),
            set_milestone_approved(i.get())
        )

    @router.method
    def withdraw(amount: abi.Uint64, *, output: abi.Void):
        # recipient (freelancer) pulls accrued funds -> their address
        amt = amount.get()
        return Seq(
            assert_sealed(1),
            Assert(role_freelancer()),
            Assert(amt > Int(0)),
            Assert(App.globalGet(G_ACCRUED) - App.globalGet(G_PAID) >= amt),
            # inner asset transfer from app to freelancer
            InnerTxnBuilder.Begin(),
            InnerTxnBuilder.SetFields({
                TxnField.type_enum: TxnType.AssetTransfer,
                TxnField.xfer_asset: App.globalGet(G_ASSET),
                TxnField.asset_receiver: App.globalGet(G_FREELANCER),
                TxnField.asset_amount: amt,
            }),
            InnerTxnBuilder.Submit(),
            App.globalPut(G_PAID, App.globalGet(G_PAID) + amt)
        )

    @router.method
    def cancelProject(reasonHash: abi.DynamicBytes, *, output: abi.Void):
        # sender cancels; compute linear kill-fee by progress (accrued remains withdrawable)
        return Seq(
            assert_sealed(1),
            Assert(role_client()),
            Assert(Len(reasonHash.get()) == Int(32)),
            Assert(App.globalGet(G_CANCELLED) == Int(0)),
            App.globalPut(G_CANCELLED, Int(1)),

            # Simple linear progress based on time; you can replace with milestone-based progress
            (start := ScratchVar(TealType.uint64)).store(App.globalGet(G_START)),
            (end   := ScratchVar(TealType.uint64)).store(App.globalGet(G_END)),
            (now   := ScratchVar(TealType.uint64)).store(Global.latest_timestamp()),
            (span  := ScratchVar(TealType.uint64)).store(If(end.load() > start.load(), end.load() - start.load(), Int(1))),
            (elapsed := ScratchVar(TealType.uint64)).store(If(now.load() > start.load(), now.load() - start.load(), Int(0))),
            (ratio := ScratchVar(TealType.uint64)).store(If(elapsed.load() > span.load(), Int(1_000_000), (elapsed.load() * Int(1_000_000)) / span.load())),
            (kill := ScratchVar(TealType.uint64)).store((App.globalGet(G_TOTAL) * ratio.load()) / Int(1_000_000)),

            # accrue kill fee to freelancer; refund remainder to client now
            App.globalPut(G_ACCRUED, App.globalGet(G_ACCRUED) + kill.load()),
            (refund := ScratchVar(TealType.uint64)).store(App.globalGet(G_TOTAL) - App.globalGet(G_PAID) - kill.load()),
            If(refund.load() > Int(0)).Then(Seq(
                InnerTxnBuilder.Begin(),
                InnerTxnBuilder.SetFields({
                    TxnField.type_enum: TxnType.AssetTransfer,
                    TxnField.xfer_asset: App.globalGet(G_ASSET),
                    TxnField.asset_receiver: App.globalGet(G_CLIENT),
                    TxnField.asset_amount: refund.load(),
                }),
                InnerTxnBuilder.Submit()
            ))
        )

    return router.compile_program(version=8)

def clear():
    # Keep clear minimal & safe
    return Return(Int(1))

if __name__ == "__main__":
    import sys
    if sys.argv[-1] == "appr":
        print(compileTeal(approval(), mode=Mode.Application, version=8))
    else:
        print(compileTeal(clear(), mode=Mode.Application, version=8))
