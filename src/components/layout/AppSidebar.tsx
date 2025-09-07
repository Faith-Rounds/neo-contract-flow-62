import { Gauge, FileText, UserCircle2, Plus } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const items = [
  { title: "Home", url: "/", icon: Gauge },
  { title: "Contracts", url: "/contracts", icon: FileText },
  { title: "New Contract", url: "/contracts/new", icon: Plus },
  { title: "Profile", url: "/profile", icon: UserCircle2 },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const isCollapsed = state === "collapsed";

  const isActive = (path: string) => {
    if (path === "/") return currentPath === "/";
    return currentPath.startsWith(path);
  };

  return (
    <Sidebar className={cn(isCollapsed ? "w-14" : "w-60")} collapsible="icon">
      <SidebarContent className="pt-8">
        {/* Logo */}
        <div className="px-4 mb-8 mr-4">
          {!isCollapsed ? (
            <h1 className="text-2xl font-heading text-primary">Mesyk</h1>
          ) : (
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-heading text-sm">M</span>
            </div>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className={({ isActive }) =>
                        cn(
                          "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200",
                          "text-black hover:bg-sidebar-accent hover:shadow-sm hover:-translate-y-0.5",
                          isActive ? "bg-primary" : ""
                        )
                      }
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0 text-black" />
                      {!isCollapsed && (
                        <span className="font-medium text-black">
                          {item.title}
                        </span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}