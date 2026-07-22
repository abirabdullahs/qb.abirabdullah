import { ReactNode } from "react";
import { Link } from "wouter";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PublicShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full flex flex-col bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <header className="h-16 border-b flex items-center px-6 md:px-12 bg-card/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex-1">
          <Link href="/" className="flex items-center gap-2 text-primary font-serif italic text-2xl tracking-tight">
            <BookOpen className="h-6 w-6 text-secondary" />
            <span>EduBank</span>
          </Link>
        </div>
        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link href="/questions" className="text-muted-foreground hover:text-foreground transition-colors">
            Browse Questions
          </Link>
          <Button asChild variant="default" size="sm" className="rounded-full px-6">
            <Link href="/dashboard">Dashboard</Link>
          </Button>
        </nav>
      </header>
      <main className="flex-1">
        {children}
      </main>
      <footer className="py-12 border-t px-6 md:px-12 bg-card text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} EduBank. Academic Question Management System.</p>
      </footer>
    </div>
  );
}
