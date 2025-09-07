import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { useContracts } from "@/lib/contracts-context";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Search, 
  Filter, 
  Download, 
  MoreHorizontal,
  FileText,
  Plus 
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// Contract interface is now imported from contracts-context

const getStatusColor = (status: string) => {
  switch (status) {
    case "Active": return "bg-accent text-accent-foreground";
    case "Draft": return "bg-slate-100 text-slate-700";
    case "Completed": return "bg-primary text-primary-foreground";
    case "Cancelled": return "bg-destructive text-destructive-foreground";
    default: return "bg-muted text-muted-foreground";
  }
};

const getRoleColor = (role: string) => {
  return role === "Sent" ? "text-primary" : "text-accent";
};

const formatTimeAgo = (date: Date) => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  
  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
};

// Mock freelancer contract for withdraw template demonstration
const freelancerContract = {
  id: "withdraw-template-1",
  title: "Mobile App Development Project",
  role: "Received",
  counterparty: "Tech Innovations Inc.",
  status: "Active",
  total: 5000,
  accrued: 3500,
  paid: 1500,
  updated: new Date("2024-08-20T14:30:00Z")
};

export default function Contracts() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [currentRole, setCurrentRole] = useState<"client" | "freelancer">("client");
  const navigate = useNavigate();
  const { contracts } = useContracts();

  // Combine regular contracts with the freelancer contract when in freelancer mode
  const allContracts = currentRole === "freelancer" 
    ? [freelancerContract, ...contracts]
    : contracts;
    
  const filteredContracts = allContracts.filter(contract => {
    const matchesSearch = contract.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.counterparty.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || contract.status === statusFilter;
    // In freelancer mode, prioritize showing the freelancer contract
    if (currentRole === "freelancer" && contract.id === "withdraw-template-1") {
      return true;
    }
    return matchesSearch && matchesStatus;
  });

  const handleRowClick = (contractId: string) => {
    // If it's the freelancer contract, navigate to the withdraw template
    if (contractId === "withdraw-template-1") {
      navigate(`/withdraw-template`);
    } else {
      navigate(`/contracts/${contractId}`);
    }
  };

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading text-ink">Contracts</h1>
          <p className="text-muted-foreground mt-1">Manage and track all your agreements</p>
        </div>
        <div className="flex items-center gap-4">
          {/* Role Toggle */}
          <Tabs value={currentRole} onValueChange={(value) => setCurrentRole(value as "client" | "freelancer")} className="mr-4">
            <TabsList>
              <TabsTrigger value="client">Client View</TabsTrigger>
              <TabsTrigger value="freelancer">Freelancer View</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <Button 
            className="hover-glow"
            onClick={() => navigate("/contracts/new")}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Contract
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by title or counterparty..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Status: {statusFilter}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setStatusFilter("All")}>
                  All Statuses
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("Active")}>
                  Active
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("Draft")}>
                  Draft
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("Completed")}>
                  Completed
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("Cancelled")}>
                  Cancelled
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Contracts Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {filteredContracts.length} Contracts
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredContracts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Counterparty</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Accrued</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContracts.map((contract) => (
                  <TableRow 
                    key={contract.id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleRowClick(contract.id)}
                  >
                    <TableCell className="font-medium">{contract.title}</TableCell>
                    <TableCell>
                      <span className={`font-medium ${getRoleColor(contract.role)}`}>
                        {contract.role}
                      </span>
                    </TableCell>
                    <TableCell>{contract.counterparty}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(contract.status)}>
                        {contract.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ${contract.total.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-medium text-accent">
                      ${contract.accrued.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatTimeAgo(contract.updated)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleRowClick(contract.id)}>
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            Export
                          </DropdownMenuItem>
                          {contract.status === "Draft" && (
                            <DropdownMenuItem className="text-destructive">
                              Cancel
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState
              title="No contracts found"
              description={searchTerm || statusFilter !== "All" 
                ? "Try adjusting your search or filters"
                : "Create your first contract to get started"
              }
              primaryAction={{
                label: "New Contract",
                onClick: () => navigate("/contracts/new")
              }}
              secondaryAction={searchTerm || statusFilter !== "All" ? {
                label: "Clear Filters",
                onClick: () => {
                  setSearchTerm("");
                  setStatusFilter("All");
                }
              } : undefined}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}