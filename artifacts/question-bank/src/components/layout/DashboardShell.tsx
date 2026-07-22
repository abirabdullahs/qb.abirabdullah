import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Library,
  BookOpen,
  ClipboardList,
  CheckCircle,
  Settings,
  Menu,
  FileText
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

export function DashboardShell({ children }: { children: ReactNode }) {
  const [location] = useLocation();

  const isCurrent = (path: string) => location === path || location.startsWith(`${path}/`);

  return (
    <SidebarProvider>
      <div className="min-h-screen w-full flex flex-col md:flex-row bg-background text-foreground">
        <Sidebar>
          <SidebarHeader className="border-b px-4 py-4 mb-2">
            <Link href="/dashboard" className="flex items-center gap-2 text-primary font-serif italic text-2xl">
              <BookOpen className="h-6 w-6 text-secondary" />
              <span>EduBank</span>
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Overview</SidebarGroupLabel>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={location === "/dashboard"}>
                    <Link href="/dashboard">
                      <LayoutDashboard className="h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isCurrent("/dashboard/review")}>
                    <Link href="/dashboard/review">
                      <CheckCircle className="h-4 w-4" />
                      <span>Review Pending</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel>Content</SidebarGroupLabel>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isCurrent("/dashboard/questions") && !location.includes('question-sets')}>
                    <Link href="/dashboard/questions">
                      <Library className="h-4 w-4" />
                      <span>Questions</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isCurrent("/dashboard/question-sets")}>
                    <Link href="/dashboard/question-sets">
                      <ClipboardList className="h-4 w-4" />
                      <span>Question Sets</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel>Taxonomy</SidebarGroupLabel>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isCurrent("/dashboard/taxonomy/subjects")}>
                    <Link href="/dashboard/taxonomy/subjects">
                      <BookOpen className="h-4 w-4" />
                      <span>Subjects</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isCurrent("/dashboard/taxonomy/chapters")}>
                    <Link href="/dashboard/taxonomy/chapters">
                      <FileText className="h-4 w-4" />
                      <span>Chapters</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isCurrent("/dashboard/taxonomy/topics")}>
                    <Link href="/dashboard/taxonomy/topics">
                      <Settings className="h-4 w-4" />
                      <span>Topics</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="p-4 border-t">
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/">Back to Site</Link>
            </Button>
          </SidebarFooter>
        </Sidebar>
        
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 border-b flex items-center px-4 md:px-6 bg-card sticky top-0 z-10 shrink-0">
            <SidebarTrigger className="md:hidden mr-4" />
            <div className="flex-1" />
            <div className="flex items-center gap-4 text-sm font-medium">
              Admin Profile
            </div>
          </header>
          <main className="flex-1 overflow-auto p-4 md:p-8">
            <div className="mx-auto max-w-6xl">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
