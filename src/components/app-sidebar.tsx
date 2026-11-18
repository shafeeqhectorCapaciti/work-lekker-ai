import { Link, useRouterState } from "@tanstack/react-router";

import { BrandMark } from "@/components/brand-mark";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { DASHBOARD_ITEM, TOOL_ITEMS, type NavItem } from "@/lib/tools-nav";

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  const { setOpenMobile } = useSidebar();
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={active} tooltip={item.title} className="h-10">
        <Link to={item.url} onClick={() => setOpenMobile(false)}>
          <item.icon />
          <span>{item.title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-3 px-1 py-2">
          <BrandMark />
          <span className="flex flex-col leading-tight group-data-[collapsible=icon]:hidden">
            <span className="font-display text-sm font-semibold text-sidebar-accent-foreground">
              WorkLekker AI
            </span>
            <span className="text-xs text-muted-foreground">by ShafeeqH</span>
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <NavLink item={DASHBOARD_ITEM} active={pathname === "/"} />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Productivity tools</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {TOOL_ITEMS.map((item) => (
                <NavLink key={item.url} item={item} active={pathname === item.url} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="group-data-[collapsible=icon]:hidden">
        <p className="px-2 pb-2 text-xs text-muted-foreground">Powered by Lovable AI</p>
      </SidebarFooter>
    </Sidebar>
  );
}
