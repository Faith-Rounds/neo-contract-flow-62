import { useState } from "react";
import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { AppTopbar } from "./AppTopbar";

export function AppLayout() {
  const [currentRole, setCurrentRole] = useState<"Cassie" | "Freddy">("Cassie");

  const handleRoleToggle = () => {
    setCurrentRole(prev => prev === "Cassie" ? "Freddy" : "Cassie");
  };

  const handleNewContract = () => {
    // TODO: Open new contract modal
    console.log("Opening new contract modal");
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <AppTopbar
            title="Dashboard"
            currentRole={currentRole}
            onRoleToggle={handleRoleToggle}
            onNewContract={handleNewContract}
          />
          <main className="flex-1 max-w-7xl mx-auto w-full pt-6 pb-16 px-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}