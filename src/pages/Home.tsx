import { useState, useEffect } from "react";
import { KpiCard } from "@/components/ui/KpiCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { 
  FileText, 
  DollarSign, 
  Clock, 
  TrendingUp,
  ArrowUpRight,
  CheckCircle,
  Upload
} from "lucide-react";

// Mock data types
interface Agreement {
  id: string;
  title: string;
  counterparty: string;
  status: "Draft" | "Active" | "Cancelled" | "Completed";
  total: number;
  accrued: number;
  role: "Sent" | "Received";
  nextAction?: string;
}

interface ActivityEntry {
  id: string;
  type: "approved" | "submitted" | "funded" | "withdrawn";
  description: string;
  amount?: number;
  agreementTitle: string;
  timestamp: Date;
}

// Mock data
const mockAgreements: Agreement[] = [
  {
    id: "1",
    title: "Website Redesign Project",
    counterparty: "Freddy Dev",
    status: "Active",
    total: 1000,
    accrued: 300,
    role: "Sent",
    nextAction: "Approve Milestone 2"
  },
  {
    id: "2",
    title: "Mobile App UI Design",
    counterparty: "Cassie Client", 
    status: "Active",
    total: 800,
    accrued: 400,
    role: "Received",
    nextAction: "Submit Milestone 3"
  }
];

const mockActivity: ActivityEntry[] = [
  {
    id: "1",
    type: "approved",
    description: "Approved Milestone 2",
    amount: 300,
    agreementTitle: "Website Redesign Project",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
  },
  {
    id: "2", 
    type: "submitted",
    description: "Submitted deliverables for review",
    agreementTitle: "Mobile App UI Design",
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000) // 6 hours ago
  }
];

const getActivityIcon = (type: string) => {
  switch (type) {
    case "approved": return <CheckCircle className="h-4 w-4 text-accent" />;
    case "submitted": return <Upload className="h-4 w-4 text-primary" />;
    case "funded": return <DollarSign className="h-4 w-4 text-accent" />;
    case "withdrawn": return <ArrowUpRight className="h-4 w-4 text-primary" />;
    default: return <Clock className="h-4 w-4 text-muted-foreground" />;
  }
};

const formatTimeAgo = (date: Date) => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  
  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
};

export default function Home() {
  const [kpiData, setKpiData] = useState({
    toFund: 0,
    availableToWithdraw: 0,
    activeAgreements: 0,
    weeklyActivity: 0
  });

  // Calculate KPIs from mock data
  useEffect(() => {
    const sentAgreements = mockAgreements.filter(a => a.role === "Sent");
    const receivedAgreements = mockAgreements.filter(a => a.role === "Received");
    
    setKpiData({
      toFund: sentAgreements.filter(a => a.status === "Draft").reduce((sum, a) => sum + a.total, 0),
      availableToWithdraw: receivedAgreements.reduce((sum, a) => sum + a.accrued, 0),
      activeAgreements: mockAgreements.filter(a => a.status === "Active").length,
      weeklyActivity: mockActivity.length
    });
  }, []);

  const sentAgreements = mockAgreements.filter(a => a.role === "Sent");
  const receivedAgreements = mockAgreements.filter(a => a.role === "Received");

  return (
    <div className="space-y-8 animate-fade-up">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard
          label="To Fund"
          value={`$${kpiData.toFund.toLocaleString()}`}
          hint="Draft contracts awaiting funding"
          accent="blue"
        />
        <KpiCard
          label="Available to Withdraw"
          value={`$${kpiData.availableToWithdraw.toLocaleString()}`}
          delta="+$300"
          hint="Your approved earnings"
          accent="green"
        />
        <KpiCard
          label="Active Agreements"
          value={kpiData.activeAgreements}
          hint="Currently running contracts"
        />
        <KpiCard
          label="Last 7d Activity"
          value={kpiData.weeklyActivity}
          delta="+2"
          hint="Recent contract events"
        />
      </div>

      {/* Streams */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sent Agreements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowUpRight className="h-5 w-5 text-primary" />
              Sent Contracts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {sentAgreements.length > 0 ? (
              sentAgreements.map((agreement) => (
                <div key={agreement.id} className="flex items-center justify-between p-4 border rounded-lg hover-glow">
                  <div className="flex-1">
                    <h4 className="font-medium text-ink">{agreement.title}</h4>
                    <p className="text-sm text-muted-foreground">{agreement.counterparty}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={agreement.status === "Active" ? "default" : "secondary"}>
                      {agreement.status}
                    </Badge>
                    {agreement.nextAction && (
                      <Button size="sm" variant="outline">
                        {agreement.nextAction}
                      </Button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <EmptyState
                title="No sent contracts"
                description="Create your first contract to get started"
                primaryAction={{
                  label: "New Contract",
                  onClick: () => console.log("New contract")
                }}
              />
            )}
          </CardContent>
        </Card>

        {/* Received Agreements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-accent" />
              Received Contracts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {receivedAgreements.length > 0 ? (
              receivedAgreements.map((agreement) => (
                <div key={agreement.id} className="flex items-center justify-between p-4 border rounded-lg hover-glow">
                  <div className="flex-1">
                    <h4 className="font-medium text-ink">{agreement.title}</h4>
                    <p className="text-sm text-muted-foreground">{agreement.counterparty}</p>
                    <p className="text-sm font-medium text-accent">${agreement.accrued} accrued</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="default" className="bg-accent text-accent-foreground">
                      {agreement.status}
                    </Badge>
                    {agreement.nextAction && (
                      <Button size="sm" className="bg-accent hover:bg-accent-600">
                        {agreement.nextAction}
                      </Button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <EmptyState
                title="No received contracts"
                description="You'll see contracts sent to you here"
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {mockActivity.length > 0 ? (
            <div className="space-y-4">
              {mockActivity.map((entry) => (
                <div key={entry.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  {getActivityIcon(entry.type)}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-ink">{entry.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {entry.agreementTitle} • {formatTimeAgo(entry.timestamp)}
                    </p>
                  </div>
                  {entry.amount && (
                    <div className="text-right">
                      <p className="text-sm font-medium text-accent">+${entry.amount}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No recent activity"
              description="Contract activity will appear here"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}