import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { EmptyState } from "@/components/ui/EmptyState";
import { ApproveModal } from "@/components/modals/ApproveModal";
import { FundModal, Receipt } from "@/components/modals/FundModal";
import { useToast } from "@/hooks/use-toast";
import { useContracts, Contract } from "@/lib/contracts-context";
import {
  ArrowLeft,
  User,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  Upload,
  Download,
  Loader2
} from "lucide-react";

// Mock contract detail data
interface Milestone {
  id: string;
  index: number;
  amount: number;
  description: string;
  status: "Draft" | "Submitted" | "Approved";
  submittedAt?: Date;
  submittedHash?: string;
  approvedAt?: Date;
}

interface ContractDetail {
  id: string;
  title: string;
  description: string;
  client: string;
  freelancer: string;
  status: "Draft" | "Active" | "Cancelled" | "Completed";
  total: number;
  accrued: number;
  paid: number;
  createdAt: Date;
  milestones: Milestone[];
}

const mockContract: ContractDetail = {
  id: "1",
  title: "Website Redesign Project",
  description: "Complete redesign of company website with modern UI/UX, responsive design, and performance optimizations.",
  client: "Cassie Client",
  freelancer: "Freddy Dev", 
  status: "Active",
  total: 1000,
  accrued: 300,
  paid: 0,
  createdAt: new Date("2024-01-15T10:00:00Z"),
  milestones: [
    {
      id: "m1",
      index: 1,
      amount: 200,
      description: "Initial wireframes and design mockups",
      status: "Approved",
      submittedAt: new Date("2024-01-20T14:30:00Z"),
      submittedHash: "0xa1b2c3d4e5f6...",
      approvedAt: new Date("2024-01-21T09:00:00Z")
    },
    {
      id: "m2", 
      index: 2,
      amount: 300,
      description: "Frontend development and responsive design implementation",
      status: "Submitted",
      submittedAt: new Date("2024-02-01T16:45:00Z"),
      submittedHash: "0xf6e5d4c3b2a1..."
    },
    {
      id: "m3",
      index: 3, 
      amount: 500,
      description: "Backend integration, testing, and deployment",
      status: "Draft"
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

export default function ContractDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getContract, updateContract } = useContracts();
  const [currentRole] = useState<"Cassie" | "Freddy">("Cassie"); // This would come from global state
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [fundModalOpen, setFundModalOpen] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const [contract, setContract] = useState<Contract | undefined>(undefined);
  const [isFunding, setIsFunding] = useState(false);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  
  // Load contract from context when component mounts or id changes
  useEffect(() => {
    if (id) {
      const contractData = getContract(id);
      if (contractData) {
        setContract(contractData);
      }
    }
  }, [id, getContract]);

  const handleApprove = (milestone: Milestone) => {
    setSelectedMilestone(milestone);
    setApproveModalOpen(true);
  };

  const handleApproveConfirm = (milestoneId: string, notes?: string) => {
    if (!contract || !id) return;
    
    // Calculate new accrued amount
    const milestone = contract.milestones?.find(m => m.id === milestoneId);
    const newAccrued = contract.accrued + (milestone?.amount || 0);
    
    // Create updated contract object
    const updatedContract = {
      ...contract,
      milestones: contract.milestones?.map(m => 
        m.id === milestoneId 
          ? { ...m, status: "Approved" as const, approvedAt: new Date() }
          : m
      ),
      accrued: newAccrued
    };
    
    // Update local state
    setContract(updatedContract);
    
    // Update in context
    updateContract(id, updatedContract);
  };

  const handleFundContract = () => {
    setFundModalOpen(true);
  };

  const handleFundConfirm = (receipt: Receipt) => {
    if (!contract || !id) return;
    
    if (receipt.status === "pending") {
      // Handle pending state
      setIsFunding(true);
      setReceipt(receipt);
    } else if (receipt.status === "confirmed") {
      // Handle confirmed state
      setIsFunding(false);
      setReceipt(receipt);
      
      // Create updated contract with Active status
      const updatedContract = {
        ...contract,
        status: "Active" as const
      };
      
      // Update local state
      setContract(updatedContract);
      
      // Update in context
      updateContract(id, updatedContract);
    } else if (receipt.status === "failed") {
      // Handle failed state
      setIsFunding(false);
      setReceipt(receipt);
      
      toast({
        title: "Funding failed",
        description: "There was an error funding the contract. Please try again.",
        variant: "destructive"
      });
    }
  };

  const isClient = currentRole === "Cassie";
  const isFreelancer = currentRole === "Freddy";

  if (!contract) {
    return (
      <EmptyState
        title="Contract not found"
        description="The contract you're looking for doesn't exist or has been removed."
        primaryAction={{
          label: "Back to Contracts",
          onClick: () => navigate("/contracts")
        }}
      />
    );
  }
  
  // Calculate derived values
  const progressPercentage = contract ? (contract.accrued / contract.total) * 100 : 0;
  const balance = contract ? contract.accrued - (contract.paid || 0) : 0;

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/contracts")}
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
                  <p className="text-2xl font-heading text-ink">${balance}</p>
                  <p className="text-xs text-muted-foreground">Balance</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                {isClient && (
                  <>
                    <Button 
                      className="hover-glow" 
                      onClick={handleFundContract}
                      disabled={isFunding || contract.status !== "Draft"}
                    >
                      {isFunding ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Funding...
                        </>
                      ) : (
                        <>
                          <DollarSign className="h-4 w-4 mr-2" />
                          Fund Contract
                        </>
                      )}
                    </Button>
                    <Button variant="outline" disabled={isFunding}>
                      Cancel Contract
                    </Button>
                  </>
                )}
                {isFreelancer && (
                  <Button className="bg-accent hover:bg-accent-600 hover-neon">
                    <Download className="h-4 w-4 mr-2" />
                    Withdraw ${balance}
                  </Button>
                )}
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

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    {milestone.status === "Draft" && isFreelancer && (
                      <Button size="sm" variant="outline">
                        <Upload className="h-4 w-4 mr-2" />
                        Submit
                      </Button>
                    )}
                    {milestone.status === "Submitted" && isClient && (
                      <Button 
                        size="sm" 
                        className="bg-accent hover:bg-accent-600"
                        onClick={() => handleApprove(milestone)}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                    )}
                  </div>
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
                  <span className="text-accent">${balance}</span>
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
              {isClient && contract.status === "Active" && (
                <div className="text-sm">
                  <p className="font-medium text-ink mb-1">Pending Approval</p>
                  <p className="text-muted-foreground">
                    Milestone 2 is waiting for your review and approval.
                  </p>
                </div>
              )}
              {isFreelancer && balance > 0 && (
                <div className="text-sm">
                  <p className="font-medium text-accent mb-1">Ready to Withdraw</p>
                  <p className="text-muted-foreground">
                    You have ${balance} available for withdrawal.
                  </p>
                </div>
              )}
              <Button variant="outline" size="sm" className="w-full">
                View Receipts
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Approve Modal */}
      {selectedMilestone && (
        <ApproveModal
          open={approveModalOpen}
          onOpenChange={setApproveModalOpen}
          milestone={selectedMilestone}
          contractTitle={contract.title}
          onApprove={handleApproveConfirm}
        />
      )}

      {/* Fund Modal */}
      <FundModal
        open={fundModalOpen}
        onOpenChange={setFundModalOpen}
        contractTitle={contract.title}
        contractTotal={contract.total}
        onFund={handleFundConfirm}
      />
    </div>
  );
}