import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface AppTopbarProps {
  title: string;
  currentRole: "Cassie" | "Freddy";
  onRoleToggle: () => void;
  onNewContract: () => void;
}

export function AppTopbar({ title, currentRole, onRoleToggle, onNewContract }: AppTopbarProps) {
  return (
    <header className="h-16 border-b bg-background flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <h1 className="text-2xl font-heading text-ink">{title}</h1>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search contracts..."
            className="w-64 pl-10"
          />
        </div>
        
        <Button onClick={onNewContract} className="hover-glow">
          <Plus className="h-4 w-4 mr-2" />
          New Contract
        </Button>
        
        <Badge 
          variant="outline" 
          className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
          onClick={onRoleToggle}
        >
          Demo: {currentRole}
        </Badge>
      </div>
    </header>
  );
}