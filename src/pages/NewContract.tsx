import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Plus, Trash2, FileText, DollarSign, Calendar, User, Target, Clock, CreditCard, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useContracts } from "@/lib/contracts-context";

interface Milestone {
  id: string;
  description: string;
  amount: number;
}

type ReceivableType = "milestone" | "hourly" | "fixed" | "equity";

interface ReceivableOption {
  id: ReceivableType;
  name: string;
  description: string;
  icon: React.ReactNode;
}

const receivableOptions: ReceivableOption[] = [
  {
    id: "milestone",
    name: "Milestone-based",
    description: "Payment tied to specific deliverables and milestones",
    icon: <Target className="h-5 w-5" />
  },
  {
    id: "hourly",
    name: "Hourly Rate",
    description: "Payment based on hours worked with time tracking",
    icon: <Clock className="h-5 w-5" />
  },
  {
    id: "fixed",
    name: "Fixed Price",
    description: "Single lump sum payment upon completion",
    icon: <CreditCard className="h-5 w-5" />
  },
  {
    id: "equity",
    name: "Equity/Revenue Share",
    description: "Payment through equity or percentage of revenue",
    icon: <TrendingUp className="h-5 w-5" />
  }
];

const templates = [
  {
    id: "website",
    name: "Website Build",
    description: "Complete website development project",
    milestones: [
      { description: "Initial wireframes and design mockups", amount: 200 },
      { description: "Frontend development and responsive design", amount: 300 },
      { description: "Backend integration, testing, and deployment", amount: 500 }
    ]
  },
  {
    id: "design",
    name: "Design Sprint", 
    description: "UI/UX design project with iterations",
    milestones: [
      { description: "Research and initial concepts", amount: 150 },
      { description: "Final designs and handoff", amount: 150 }
    ]
  }
];

export default function NewContract() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addContract } = useContracts();

  // Form data
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    freelancerEmail: "",
    receivableType: "milestone" as ReceivableType,
    milestones: [] as Milestone[]
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addMilestone = () => {
    const newMilestone: Milestone = {
      id: `milestone-${Date.now()}`,
      description: "",
      amount: 0
    };
    setFormData(prev => ({
      ...prev,
      milestones: [...prev.milestones, newMilestone]
    }));
  };

  const updateMilestone = (id: string, field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      milestones: prev.milestones.map(m => 
        m.id === id ? { ...m, [field]: value } : m
      )
    }));
  };

  const removeMilestone = (id: string) => {
    setFormData(prev => ({
      ...prev,
      milestones: prev.milestones.filter(m => m.id !== id)
    }));
  };

  const useTemplate = (template: typeof templates[0]) => {
    setFormData(prev => ({
      ...prev,
      title: template.name,
      description: template.description,
      milestones: template.milestones.map((m, index) => ({
        id: `milestone-${index}`,
        description: m.description,
        amount: m.amount
      }))
    }));
    setStep(2);
  };

  const handleSubmit = async () => {
    setLoading(true);
    
    try {
      // Create a new contract using the context
      const newContractId = addContract({
        title: formData.title,
        description: formData.description,
        role: "Sent",
        counterparty: formData.freelancerEmail.split('@')[0] || "Freelancer", // Simple extraction of name from email
        status: "Draft",
        total: totalAmount,
        accrued: 0,
        milestones: formData.milestones.map((m, index) => ({
          id: m.id,
          index: index + 1,
          amount: m.amount,
          description: m.description,
          status: "Draft"
        }))
      });
      
      toast({
        title: "Contract created!",
        description: "Your contract has been created and is ready to be funded.",
      });
      
      // Navigate to the contracts list
      navigate("/contracts");
    } catch (error) {
      console.error("Error creating contract:", error);
      toast({
        title: "Error creating contract",
        description: "There was a problem creating your contract. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = formData.milestones.reduce((sum, m) => sum + m.amount, 0);
  const progress = (step / 3) * 100;

  const canProceedStep1 = formData.title.trim() && formData.description.trim();
  const canProceedStep2 = formData.receivableType === "milestone" 
    ? formData.milestones.length > 0 && formData.milestones.every(m => m.description.trim() && m.amount > 0)
    : true; // For other types, we assume the form is valid for now
  const canProceedStep3 = formData.freelancerEmail.trim();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/contracts")}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Contracts
            </Button>
            <div>
              <h1 className="text-3xl font-heading text-ink">Create New Contract</h1>
              <p className="text-muted-foreground mt-1">Set up a new freelance agreement</p>
            </div>
          </div>
          <Badge variant="outline" className="px-3 py-1">
            Step {step} of 3
          </Badge>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between mt-2 text-sm text-muted-foreground">
            <span className={step >= 1 ? "text-primary" : ""}>Project Details</span>
            <span className={step >= 2 ? "text-primary" : ""}>Payment Setup</span>
            <span className={step >= 3 ? "text-primary" : ""}>Review & Send</span>
          </div>
        </div>

        <div className="animate-fade-in">
          {/* Step 1: Project Details */}
          {step === 1 && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Project Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Project Title</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Website Redesign Project"
                      value={formData.title}
                      onChange={(e) => handleInputChange("title", e.target.value)}
                      className="focus:shadow-glow"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Project Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe the project scope, requirements, and deliverables..."
                      rows={4}
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      className="focus:shadow-glow"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Receivable Type Selection */}
              <Card>
                <CardHeader>
                  <CardTitle>Receivable Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {receivableOptions.map((option) => (
                      <div
                        key={option.id}
                        className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                          formData.receivableType === option.id 
                            ? "border-primary bg-primary/5 shadow-glow" 
                            : "hover:border-muted-foreground/30"
                        }`}
                        onClick={() => handleInputChange("receivableType", option.id)}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-md ${
                            formData.receivableType === option.id 
                              ? "bg-primary text-primary-foreground" 
                              : "bg-muted"
                          }`}>
                            {option.icon}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-ink mb-1">{option.name}</h4>
                            <p className="text-sm text-muted-foreground">{option.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Templates */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Start Templates</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {templates.map((template) => (
                      <div
                        key={template.id}
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => useTemplate(template)}
                      >
                        <h4 className="font-medium text-ink mb-2">{template.name}</h4>
                        <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            {template.milestones.length} milestones
                          </span>
                          <span className="text-sm font-medium text-primary">
                            ${template.milestones.reduce((sum, m) => sum + m.amount, 0)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button
                  onClick={() => setStep(2)}
                  disabled={!canProceedStep1}
                  className="gap-2 hover-glow"
                >
                  Next: {formData.receivableType === "milestone" ? "Milestones" : "Payment Setup"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Milestones */}
          {step === 2 && (
            <div className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    {formData.receivableType === "milestone" ? "Project Milestones" : 
                     formData.receivableType === "hourly" ? "Hourly Rate Setup" :
                     formData.receivableType === "fixed" ? "Fixed Price Setup" : 
                     "Equity/Revenue Setup"}
                  </CardTitle>
                  {formData.receivableType === "milestone" && (
                    <Button onClick={addMilestone} size="sm" variant="outline" className="gap-2">
                      <Plus className="h-4 w-4" />
                      Add Milestone
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  {formData.receivableType === "milestone" ? (
                    <>
                      {formData.milestones.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <p>No milestones added yet.</p>
                          <p className="text-sm">Click "Add Milestone" to get started.</p>
                        </div>
                      ) : (
                        formData.milestones.map((milestone, index) => (
                          <div key={milestone.id} className="border rounded-lg p-4 space-y-3">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">Milestone {index + 1}</h4>
                              <Button
                                onClick={() => removeMilestone(milestone.id)}
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              <div className="md:col-span-2">
                                <Label htmlFor={`milestone-desc-${milestone.id}`}>Description</Label>
                                <Input
                                  id={`milestone-desc-${milestone.id}`}
                                  placeholder="Milestone deliverable description"
                                  value={milestone.description}
                                  onChange={(e) => updateMilestone(milestone.id, "description", e.target.value)}
                                />
                              </div>
                              <div>
                                <Label htmlFor={`milestone-amount-${milestone.id}`}>Amount (USDC)</Label>
                                <Input
                                  id={`milestone-amount-${milestone.id}`}
                                  type="number"
                                  placeholder="0"
                                  value={milestone.amount || ""}
                                  onChange={(e) => updateMilestone(milestone.id, "amount", parseFloat(e.target.value) || 0)}
                                />
                              </div>
                            </div>
                          </div>
                        ))
                      )}

                      {formData.milestones.length > 0 && (
                        <>
                          <Separator />
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Total Contract Value</span>
                            <span className="text-2xl font-heading text-primary">${totalAmount.toLocaleString()}</span>
                          </div>
                        </>
                      )}
                    </>
                  ) : formData.receivableType === "hourly" ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="hourlyRate">Hourly Rate (USDC)</Label>
                          <Input
                            id="hourlyRate"
                            type="number"
                            placeholder="50"
                            className="focus:shadow-glow"
                          />
                        </div>
                        <div>
                          <Label htmlFor="estimatedHours">Estimated Hours</Label>
                          <Input
                            id="estimatedHours"
                            type="number"
                            placeholder="40"
                            className="focus:shadow-glow"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="maxHours">Maximum Hours (Optional)</Label>
                        <Input
                          id="maxHours"
                          type="number"
                          placeholder="100"
                          className="focus:shadow-glow"
                        />
                        <p className="text-sm text-muted-foreground mt-1">
                          Set a cap on billable hours to prevent overruns
                        </p>
                      </div>
                    </div>
                  ) : formData.receivableType === "fixed" ? (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="fixedAmount">Fixed Payment Amount (USDC)</Label>
                        <Input
                          id="fixedAmount"
                          type="number"
                          placeholder="5000"
                          className="focus:shadow-glow"
                        />
                      </div>
                      <div>
                        <Label htmlFor="deliveryDate">Expected Delivery Date</Label>
                        <Input
                          id="deliveryDate"
                          type="date"
                          className="focus:shadow-glow"
                        />
                      </div>
                      <div>
                        <Label htmlFor="paymentTerms">Payment Terms</Label>
                        <select className="w-full p-2 border rounded-md">
                          <option value="completion">Payment on completion</option>
                          <option value="50-50">50% upfront, 50% on completion</option>
                          <option value="30-70">30% upfront, 70% on completion</option>
                        </select>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="equityPercentage">Equity Percentage (%)</Label>
                          <Input
                            id="equityPercentage"
                            type="number"
                            step="0.1"
                            placeholder="2.5"
                            className="focus:shadow-glow"
                          />
                        </div>
                        <div>
                          <Label htmlFor="revenueShare">Revenue Share (%)</Label>
                          <Input
                            id="revenueShare"
                            type="number"
                            step="0.1"
                            placeholder="5"
                            className="focus:shadow-glow"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="vestingPeriod">Vesting Period (months)</Label>
                        <Input
                          id="vestingPeriod"
                          type="number"
                          placeholder="12"
                          className="focus:shadow-glow"
                        />
                      </div>
                      <div>
                        <Label htmlFor="minimumPayout">Minimum Guaranteed Payment (USDC)</Label>
                        <Input
                          id="minimumPayout"
                          type="number"
                          placeholder="1000"
                          className="focus:shadow-glow"
                        />
                        <p className="text-sm text-muted-foreground mt-1">
                          Optional minimum payment regardless of equity/revenue performance
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex justify-between">
                <Button onClick={() => setStep(1)} variant="outline" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  disabled={!canProceedStep2}
                  className="gap-2 hover-glow"
                >
                  Next: Review
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Review & Send */}
          {step === 3 && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Freelancer Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="freelancerEmail">Freelancer Email</Label>
                    <Input
                      id="freelancerEmail"
                      type="email"
                      placeholder="freelancer@example.com"
                      value={formData.freelancerEmail}
                      onChange={(e) => handleInputChange("freelancerEmail", e.target.value)}
                      className="focus:shadow-glow"
                    />
                    <p className="text-sm text-muted-foreground">
                      An invitation will be sent to this email address
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Contract Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Contract Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Project Title</p>
                      <p className="font-medium">{formData.title}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Value</p>
                      <p className="font-medium text-primary">${totalAmount.toLocaleString()}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Description</p>
                    <p className="font-medium">{formData.description}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Milestones ({formData.milestones.length})</p>
                    <div className="space-y-2">
                      {formData.milestones.map((milestone, index) => (
                        <div key={milestone.id} className="flex justify-between items-center p-2 bg-slateB-50 rounded">
                          <span className="text-sm">{index + 1}. {milestone.description}</span>
                          <span className="font-medium">${milestone.amount}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-between">
                <Button onClick={() => setStep(2)} variant="outline" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!canProceedStep3 || loading}
                  className="gap-2 hover-glow"
                >
                  {loading ? "Creating Contract..." : "Create Contract"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}