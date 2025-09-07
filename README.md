# Mesyk: Reimagining Global Work with Algorand Escrow

## Short Summary :
Mesyk is a decentralized, milestone-based escrow platform on Algorand, unlocking trust and efficiency in the global workforce.

## The Vision
Work is borderless, trust is not.

Millions of freelancers and businesses across the world face the same broken system: late payments, predatory intermediaries, and endless disputes. The global workforce is ready for a fair, transparent, and programmable layer of trust.

Mesyk is that layer.

By combining Algorand's speed, security, and scalability with an intuitive, non-marketplace experience, Mesyk empowers two people—anywhere on Earth—to collaborate confidently, knowing that agreements are enforced by code, not bureaucracy.

This isn't just payments. This is a new operating system for work.

## The Problem
Freelancers: constantly chasing payments, accepting risk just to work.

Clients: fearing scope creep, fraud, or unfinished deliverables.

Platforms: charging 10–20%+ fees, adding friction, and holding funds hostage.

Result: A system that doesn't scale with the borderless, digital-first economy.

## The Mesyk Solution
Mesyk strips away the noise of traditional marketplaces and replaces it with trustless milestone-based contracts:

- Invite-only agreements: no profiles, no ratings, no public browsing—just work and trust.
- USDC escrow on Algorand: stable-value funds locked securely until work is delivered.
- Milestone-based approvals: freelancers submit hashed deliverables; clients approve in phases.
- Withdraw-time payouts: clean accounting, transparent receipts, and predictable cashflow.
- Fair cancellation logic: if a project ends early, freelancers earn a proportional kill fee, clients get refunds instantly.

With Mesyk, the global workforce no longer relies on intermediaries—just agreements, code, and trust.

## How Algorand Powers Mesyk
Mesyk exists because Algorand offers a unique mix of speed, cost-efficiency, and advanced features:

- Stateful Smart Contracts with boxes: store per-milestone data directly on-chain.
- Atomic Transfers: guarantee that funding + contract initialization happen together.
- Inner Transactions: secure escrow withdrawals and refunds without exposing user wallets.
- USDC on Algorand: stable, global value-transfer baked directly into agreements.
- Immutability by design: contracts "seal" themselves after initialization—no backdoors, no updates.

## Technical Breakdown:
- Frontend: React, Vite, Zustand (state), Dexie (IndexedDB persistence), Tailwind + shadcn/ui, Framer Motion animations.
- Contracts: PyTeal v8 (custom, non-boilerplate escrow logic).
- Blockchain SDKs: Algorand Python SDK, Algorand JS SDK for integration.
- Local-first UX: mock onramp/offramp, seeded demo contracts, invite-based flows.
- Demo signer proxy: allows chain interaction without exposing wallets in UI.

## Smart Contract Design
One Algorand contract = one agreement.

### Globals
client, freelancer, assetId, total, accrued, paid, cancelled, startTs, endTs, specHash, sealed.

### Boxes
per-milestone storage (m0, m1, ...) with amount, submitted, approved, hash, approvedAt.

### Core methods
- **initAndFund(...)**: escrow funding + contract setup, sealed immutability.
- **submitMilestone(i, hash)**: freelancer submits deliverable (hash-stored).
- **approveMilestone(i)**: client approves milestone → accrues balance.
- **withdraw(amount)**: freelancer withdraws escrowed funds (inner transfer).
- **cancelProject(reasonHash)**: computes kill fee, refunds client remainder.

### Security
- No rekey/close-to allowed.
- Group atomicity enforced.
- Role-based permissions.
- Update/Delete permanently disabled after seal.

## Demo & Walkthrough
- Demo video: https://drive.google.com/file/d/1HiT7-6I9uy-6udm2Dv_kCe6Js3L9LjFr/view?usp=share_link
- Code walkthrough video (with audio): https://drive.google.com/file/d/1HuSSraYvaqSBE4YH-XPRKEHRrAQ9nwx2/view?usp=share_link
- Presentation slides (Canva): https://www.canva.com/design/DAGyTxAPf_s/Tdd4a-Rq1GLzKfdQ5enA_w/edit?utm_content=DAGyTxAPf_s&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton

## Screenshots
Screenshots are located in src/assets folder.


## Why This Matters
Mesyk isn't just another escrow app.

It's a blueprint for the future of global collaboration—where a designer in Lagos, a developer in São Paulo, and a client in Berlin can collaborate seamlessly, with trust enforced by Algorand, not middlemen.

Mesyk shows that work doesn't need borders, but it does need fairness. And with Algorand, we've built it.
