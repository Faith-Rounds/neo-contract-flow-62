import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CancelContractModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contractTitle: string;
  contractTotal: number;
  contractStartDate: Date;
  onCancel: (reason: string, killFee: number) => void;
}

export function CancelContractModal({ 
  open, 
  onOpenChange, 
  contractTitle, 
  contractTotal,
  contractStartDate,
  onCancel 
}: CancelContractModalProps) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [killFeePercentage, setKillFeePercentage] = useState(0);
  const [killFeeAmount, setKillFeeAmount] = useState(0);
  const { toast } = useToast();

  // Calculate kill fee based on contract duration
  useEffect(() => {
    if (open) {
      const now = new Date();
      const contractDuration = now.getTime() - contractStartDate.getTime();
      const durationInDays = contractDuration / (1000 * 60 * 60 * 24);
      
      // Calculate kill fee percentage based on duration
      let percentage = 0;
      if (durationInDays < 7) {
        percentage = 10; // 10% if less than a week
      } else if (durationInDays < 14) {
        percentage = 15; // 15% if less than two weeks
      } else if (durationInDays < 30) {
        percentage = 25; // 25% if less than a month
      } else {
        percentage = 35; // 35% if more than a month
      }
      
      setKillFeePercentage(percentage);
      setKillFeeAmount((contractTotal * percentage) / 100);
    }
  }, [open, contractStartDate, contractTotal]);

  const handleCancel = async () => {
    if (!reason.trim()) {
      toast({
        title: "Reason required",
        description: "Please provide a reason for cancellation.",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    
    // Mock cancellation process
    setTimeout(() => {
      onCancel(reason, killFeeAmount);
      toast({
        title: "Contract cancelled",
        description: `The contract has been cancelled with a ${killFeePercentage}% kill fee.`,
      });
      setLoading(false);
      onOpenChange(false);
      setReason("");
    }, 1000);
  };

  const handleClose = () => {
    onOpenChange(false);
    setReason("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Cancel Contract
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. A kill fee will apply.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Contract Info */}
          <div className="space-y-2">
            <h3 className="font-medium text-lg">{contractTitle}</h3>
            
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Kill Fee ({killFeePercentage}%)</span>
                <span className="font-medium text-destructive">${killFeeAmount.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Refund Amount</span>
                <span className="font-medium">${(contractTotal - killFeeAmount).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Cancellation Reason */}
          <div className="space-y-3">
            <label htmlFor="reason" className="text-sm font-medium">Cancellation Reason</label>
            <Textarea
              id="reason"
              placeholder="Please explain why you're cancelling this contract..."
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="focus:shadow-glow"
            />
          </div>

          {/* Info Note */}
          <div className="bg-muted rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  The kill fee is calculated based on the contract duration. The freelancer will receive the kill fee amount, and you'll be refunded the remainder.
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button 
            variant="outline" 
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleCancel}
            disabled={loading || !reason.trim()}
            variant="destructive"
            className="gap-2"
          >
            {loading ? "Cancelling..." : "Confirm Cancellation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
