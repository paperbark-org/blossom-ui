import type { Metadata } from "next";
import "./globals.css";
import { OpenClawProvider } from "@/contexts/OpenClawContext";
import { AppSidebar } from "@/components/Sidebar";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";

export const metadata: Metadata = {
  title: "Blossom Gateway",
  description: "Control panel for the Blossom AI gateway",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body>
        <OpenClawProvider>
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
              <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
                <SidebarTrigger className="-ml-1" />
              </header>
              <main className="flex-1 overflow-y-auto">
                {children}
              </main>
            </SidebarInset>
          </SidebarProvider>
        </OpenClawProvider>
      </body>
    </html>
  );
}
