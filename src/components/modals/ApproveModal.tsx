import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Hash, Calendar, DollarSign, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Milestone {
  id: string;
  index: number;
  amount: number;
  description: string;
  status: "Draft" | "Submitted" | "Approved";
  submittedAt?: Date;
  submittedHash?: string;
}

interface ApproveModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  milestone: Milestone;
  contractTitle: string;
  onApprove: (milestoneId: string, notes?: string) => void;
}

export function ApproveModal({ 
  open, 
  onOpenChange, 
  milestone, 
  contractTitle, 
  onApprove 
}: ApproveModalProps) {
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleApprove = async () => {
    setLoading(true);
    
    // Mock approval process
    setTimeout(() => {
      onApprove(milestone.id, notes);
      toast({
        title: "Milestone approved!",
        description: `$${milestone.amount} has been accrued and is available for withdrawal.`,
      });
      setLoading(false);
      onOpenChange(false);
      setNotes("");
    }, 1000);
  };

  const handleCancel = () => {
    onOpenChange(false);
    setNotes("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-accent" />
            Approve Milestone
          </DialogTitle>
          <DialogDescription>
            Review and approve the submitted milestone deliverable
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Contract & Milestone Info */}
          <div className="space-y-4">
            <div>
              <Label className="text-sm text-muted-foreground">Contract</Label>
              <p className="font-medium text-ink">{contractTitle}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-muted-foreground">Milestone</Label>
                <p className="font-medium">#{milestone.index}: {milestone.description}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Amount</Label>
                <p className="font-medium text-accent text-lg">${milestone.amount.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Submission Details */}
          {milestone.submittedHash && (
            <div className="space-y-4">
              <h4 className="font-medium text-ink flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Submission Details
              </h4>
              
              <div className="bg-slateB-50 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  <Label className="text-sm">Submission Hash</Label>
                </div>
                <div className="font-mono text-sm bg-white p-2 rounded border">
                  {milestone.submittedHash}
                </div>
                
                {milestone.submittedAt && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    Submitted on {milestone.submittedAt.toLocaleString()}
                  </div>
                )}
              </div>
            </div>
          )}

          <Separator />

          {/* Approval Notes */}
          <div className="space-y-3">
            <Label htmlFor="notes">Approval Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any feedback or notes about this milestone approval..."
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="focus:shadow-glow"
            />
            <p className="text-sm text-muted-foreground">
              These notes will be recorded with the approval transaction
            </p>
          </div>

          {/* Approval Summary */}
          <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-accent mt-0.5" />
              <div className="space-y-2">
                <p className="font-medium text-ink">Ready to approve</p>
                <p className="text-sm text-muted-foreground">
                  Approving this milestone will:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>• Add ${milestone.amount} to the freelancer's withdrawable balance</li>
                  <li>• Record the approval on-chain with timestamp</li>
                  <li>• Send notification to the freelancer</li>
                  <li>• Update the contract's accrual status</li>
                </ul>
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
            onClick={handleApprove}
            disabled={loading}
            className="bg-accent hover:bg-accent-600 hover-glow gap-2"
          >
            {loading ? (
              "Approving..."
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                Approve Milestone
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}