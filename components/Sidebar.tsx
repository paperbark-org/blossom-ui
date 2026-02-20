"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useOpenClaw } from "@/contexts/OpenClawContext";
import {
  LayoutDashboard,
  MessageSquare,
  Bot,
  List,
  Cpu,
  Zap,
  Clock,
  Settings,
  ScrollText,
  Wifi,
  WifiOff,
  Loader2,
  Flower2,
} from "lucide-react";
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";

const NAV_ITEMS = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/chat", label: "Chat", icon: MessageSquare },
  { href: "/agents", label: "Agents", icon: Bot },
  { href: "/sessions", label: "Sessions", icon: List },
  { href: "/models", label: "Models", icon: Cpu },
  { href: "/skills", label: "Skills", icon: Zap },
  { href: "/cron", label: "Cron", icon: Clock },
  { href: "/config", label: "Config", icon: Settings },
  { href: "/logs", label: "Logs", icon: ScrollText },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { state, isConnected } = useOpenClaw();

  return (
    <ShadcnSidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1">
          <Flower2 className="h-5 w-5 text-primary" />
          <span className="text-sm font-bold text-foreground">
            Blossom
          </span>
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
            Gateway
          </Badge>
        </div>
      </SidebarHeader>

      <SidebarSeparator />

      {/* Connection status */}
      <div className="px-4 py-2">
        <div className="flex items-center gap-2">
          {state === "connected" ? (
            <Wifi className="h-3.5 w-3.5 text-success" />
          ) : state === "connecting" || state === "authenticating" ? (
            <Loader2 className="h-3.5 w-3.5 text-warning animate-spin" />
          ) : (
            <WifiOff className="h-3.5 w-3.5 text-destructive" />
          )}
          <span
            className={`text-[11px] font-medium ${
              isConnected
                ? "text-success"
                : state === "connecting" || state === "authenticating"
                  ? "text-warning"
                  : "text-destructive"
            }`}
          >
            {state === "connected"
              ? "Connected"
              : state === "connecting"
                ? "Connecting..."
                : state === "authenticating"
                  ? "Authenticating..."
                  : state === "error"
                    ? "Error"
                    : "Disconnected"}
          </span>
        </div>
      </div>

      <SidebarSeparator />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => {
                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);
                const Icon = item.icon;

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.label}
                    >
                      <Link href={item.href}>
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="px-2 py-1 text-[10px] text-muted-foreground">
          Blossom Gateway UI
        </div>
      </SidebarFooter>
    </ShadcnSidebar>
  );
}
