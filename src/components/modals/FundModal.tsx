import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { DollarSign, Info, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from 'uuid';

interface FundModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contractTitle: string;
  contractTotal: number;
  onFund: (receipt: Receipt) => void;
}

export interface Receipt {
  id: string;
  contractId: string;
  type: "fund";
  amount: number;
  fee: number;
  status: "pending" | "confirmed" | "failed";
  timestamp: Date;
  txIds: string[];
}

export function FundModal({ 
  open, 
  onOpenChange, 
  contractTitle, 
  contractTotal,
  onFund 
}: FundModalProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const fee = 0.99; // Fixed fee in USD

  const handleFund = async () => {
    setLoading(true);
    
    // Create a receipt with pending status
    const receipt: Receipt = {
      id: uuidv4(),
      contractId: "1", // This would come from the contract
      type: "fund",
      amount: contractTotal,
      fee: fee,
      status: "pending",
      timestamp: new Date(),
      txIds: []
    };
    
    // Call the onFund callback with the receipt
    onFund(receipt);
    
    // Mock funding process (UI-only / NoopChain)
    setTimeout(() => {
      // Update the receipt with confirmed status and mock transaction ID
      const updatedReceipt: Receipt = {
        ...receipt,
        status: "confirmed",
        txIds: [`mock_fund_${uuidv4()}`]
      };
      
      // Call the onFund callback with the updated receipt
      onFund(updatedReceipt);
      
      toast({
        title: "Escrow funded",
        description: `$${contractTotal} has been successfully added to the escrow.`,
      });
      
      setLoading(false);
      onOpenChange(false);
    }, 2000);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Fund Contract
          </DialogTitle>
          <DialogDescription>
            Fund the escrow account for this contract
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Contract Info */}
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-lg">{contractTitle}</h3>
            </div>

            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="font-medium">${contractTotal.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Creation fee</span>
                <span className="text-sm">${fee}</span>
              </div>
              
              <Separator className="my-2" />
              
              <div className="flex justify-between items-center">
                <span className="font-medium">Total to pay</span>
                <span className="font-medium">${(contractTotal + fee).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Info Note */}
          <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-accent mt-0.5" />
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  You'll fund the escrow account for this contract. No funds will be paid out until milestones are approved.
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button 
            variant="outline" 
            onClick={handleCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleFund}
            disabled={loading}
            className="hover-glow gap-2"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Funding...
              </div>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                Fund Now
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
