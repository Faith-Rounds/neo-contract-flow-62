import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { WithdrawFundsModal } from "@/components/modals/WithdrawFundsModal";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  User,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  Download,
  Loader2
} from "lucide-react";

// Mock contract data for a freelancer with available balance
const mockContract = {
  id: "withdraw-template-1",
  title: "Mobile App Development Project",
  description: "Development of a cross-platform mobile application with React Native, including user authentication, data synchronization, and offline functionality.",
  client: "Tech Innovations Inc.",
  freelancer: "Freddy Dev",
  status: "Active",
  total: 5000,
  accrued: 3500, // 70% of work approved
  paid: 1500,    // Some funds already withdrawn
  createdAt: new Date("2024-06-15T10:00:00Z"),
  updated: new Date("2024-08-20T14:30:00Z"),
  milestones: [
    {
      id: "m1",
      index: 1,
      amount: 1000,
      description: "Project setup and wireframes",
      status: "Approved",
      submittedAt: new Date("2024-06-25T14:30:00Z"),
      submittedHash: "0xa1b2c3d4e5f6...",
      approvedAt: new Date("2024-06-27T09:00:00Z")
    },
    {
      id: "m2",
      index: 2,
      amount: 1500,
      description: "User authentication and core functionality",
      status: "Approved",
      submittedAt: new Date("2024-07-15T16:45:00Z"),
      submittedHash: "0xf6e5d4c3b2a1...",
      approvedAt: new Date("2024-07-17T10:30:00Z")
    },
    {
      id: "m3",
      index: 3,
      amount: 1000,
      description: "Data synchronization implementation",
      status: "Approved",
      submittedAt: new Date("2024-08-05T11:20:00Z"),
      submittedHash: "0x7a8b9c0d1e2f...",
      approvedAt: new Date("2024-08-07T14:15:00Z")
    },
    {
      id: "m4",
      index: 4,
      amount: 1500,
      description: "Offline functionality and final testing",
      status: "Submitted",
      submittedAt: new Date("2024-08-20T09:45:00Z"),
      submittedHash: "0x3e4f5a6b7c8d..."
    }
  ]
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "Active": return "bg-accent text-accent-foreground";
    case "Draft": return "bg-slate-100 text-slate-700";
    case "Completed": return "bg-primary text-primary-foreground";
    case "Approved": return "bg-accent text-accent-foreground";
    case "Submitted": return "bg-primary text-primary-foreground";
    case "Cancelled": return "bg-destructive text-destructive-foreground";
    default: return "bg-muted text-muted-foreground";
  }
};

const getMilestoneIcon = (status: string) => {
  switch (status) {
    case "Approved": return <CheckCircle className="h-4 w-4 text-accent" />;
    case "Submitted": return <AlertCircle className="h-4 w-4 text-primary" />;
    case "Draft": return <Clock className="h-4 w-4 text-muted-foreground" />;
    default: return <Clock className="h-4 w-4 text-muted-foreground" />;
  }
};

export default function WithdrawTemplate() {
  const { toast } = useToast();
  const [contract, setContract] = useState(mockContract);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  
  // Calculate derived values
  const progressPercentage = (contract.accrued / contract.total) * 100;
  const availableBalance = contract.accrued - contract.paid;

  const handleWithdrawFunds = (amount: number, method: string, details: any) => {
    setIsWithdrawing(true);
    
    // Create updated contract with updated paid amount
    const updatedContract = {
      ...contract,
      paid: contract.paid + amount
    };
    
    // Update local state
    setTimeout(() => {
      setContract(updatedContract);
      setIsWithdrawing(false);
      toast({
        title: "Withdrawal successful",
        description: `$${amount.toFixed(2)} has been withdrawn to your ${method === "bank" ? "bank account" : method === "card" ? "card" : "crypto wallet"}.`
      });
    }, 1500);
  };

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-heading text-ink">{contract.title}</h1>
            <p className="text-muted-foreground mt-1">Contract #{contract.id}</p>
          </div>
        </div>
        <Badge className={getStatusColor(contract.status)}>
          {contract.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contract Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Contract Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{contract.description}</p>
              
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <span className="font-medium">{contract.client}</span> ↔ <span className="font-medium">{contract.freelancer}</span>
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Created {contract.createdAt.toLocaleDateString()}
                </div>
              </div>

              {/* Quick Metrics */}
              <div className="grid grid-cols-4 gap-4 pt-4">
                <div className="text-center">
                  <p className="text-2xl font-heading text-ink">${contract.total}</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-heading text-accent">${contract.accrued}</p>
                  <p className="text-xs text-muted-foreground">Accrued</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-heading text-primary">${contract.paid}</p>
                  <p className="text-xs text-muted-foreground">Paid</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-heading text-ink">${availableBalance}</p>
                  <p className="text-xs text-muted-foreground">Available</p>
                </div>
              </div>

              {/* Withdraw Button - Main Feature */}
              <div className="flex gap-3 pt-4">
                <Button 
                  className="bg-accent hover:bg-accent-600 hover-neon"
                  onClick={() => setWithdrawModalOpen(true)}
                  disabled={availableBalance <= 0 || isWithdrawing}
                >
                  {isWithdrawing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Withdraw ${availableBalance}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Milestones */}
          <Card>
            <CardHeader>
              <CardTitle>Milestones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {contract.milestones.map((milestone) => (
                <div key={milestone.id} className="border rounded-lg p-4 hover-glow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getMilestoneIcon(milestone.status)}
                      <div>
                        <h4 className="font-medium text-ink">
                          Milestone {milestone.index}: {milestone.description}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          ${milestone.amount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(milestone.status)}>
                      {milestone.status}
                    </Badge>
                  </div>

                  {milestone.submittedHash && (
                    <div className="text-xs text-muted-foreground mb-2">
                      <strong>Hash:</strong> {milestone.submittedHash}
                      {milestone.submittedAt && (
                        <span className="ml-3">
                          <strong>Submitted:</strong> {milestone.submittedAt.toLocaleString()}
                        </span>
                      )}
                    </div>
                  )}

                  {milestone.approvedAt && (
                    <div className="text-xs text-muted-foreground mb-2">
                      <strong>Approved:</strong> {milestone.approvedAt.toLocaleString()}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Accrual Progress</span>
                  <span>{progressPercentage.toFixed(1)}%</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>
              
              <Separator />
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Approved</span>
                  <span className="font-medium text-accent">${contract.accrued}</span>
                </div>
                <div className="flex justify-between">
                  <span>Withdrawn</span>
                  <span className="font-medium">${contract.paid}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Available</span>
                  <span className="text-accent">${availableBalance}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Next Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Next Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm">
                <p className="font-medium text-accent mb-1">Ready to Withdraw</p>
                <p className="text-muted-foreground">
                  You have ${availableBalance} available for withdrawal.
                </p>
              </div>
              <div className="text-sm">
                <p className="font-medium text-ink mb-1">Pending Client Approval</p>
                <p className="text-muted-foreground">
                  Milestone 4 is waiting for client review.
                </p>
              </div>
              <Button variant="outline" size="sm" className="w-full">
                View Receipts
              </Button>
            </CardContent>
          </Card>

          {/* Payment History */}
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm border-b pb-2">
                <div className="flex justify-between mb-1">
                  <span className="font-medium">July 25, 2024</span>
                  <span className="text-primary">$1,000</span>
                </div>
                <p className="text-muted-foreground text-xs">
                  Withdrawal to Bank Account (****1234)
                </p>
              </div>
              <div className="text-sm border-b pb-2">
                <div className="flex justify-between mb-1">
                  <span className="font-medium">July 5, 2024</span>
                  <span className="text-primary">$500</span>
                </div>
                <p className="text-muted-foreground text-xs">
                  Withdrawal to Credit Card (****5678)
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Withdraw Funds Modal */}
      <WithdrawFundsModal
        open={withdrawModalOpen}
        onOpenChange={setWithdrawModalOpen}
        contractTitle={contract.title}
        availableBalance={availableBalance}
        onWithdraw={handleWithdrawFunds}
      />
    </div>
  );
}
