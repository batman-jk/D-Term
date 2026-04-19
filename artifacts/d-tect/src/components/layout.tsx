import { Link, useLocation } from "wouter";
import { ModeToggle } from "./mode-toggle";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "./ui/button";
import { LogOut, User, LayoutDashboard, FileText, BarChart, BookOpen, GraduationCap } from "lucide-react";

export function Layout({ children }: { children: React.ReactNode }) {
  const { role, logout, studentProfile } = useAuth();
  const [location] = useLocation();

  const handleLogout = () => {
    logout();
  };

  const isAdmin = role === "admin";
  const isStudent = role === "student";

  // Hide layout for exam taking mode to enforce fullscreen focus
  if (location === "/student/exam") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-6 md:gap-8">
            <Link href={isAdmin ? "/admin" : isStudent ? "/student" : "/"} className="flex items-center space-x-2">
              <span className="font-bold text-xl tracking-tight">D-Tect</span>
            </Link>
            
            {isAdmin && (
              <nav className="hidden md:flex items-center space-x-1 text-sm font-medium">
                <Link 
                  href="/admin" 
                  className={`px-3 py-2 rounded-md transition-colors ${location === "/admin" ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"}`}
                >
                  Dashboard
                </Link>
                <Link 
                  href="/admin/exams" 
                  className={`px-3 py-2 rounded-md transition-colors ${location.startsWith("/admin/exams") ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"}`}
                >
                  Exams
                </Link>
                <Link 
                  href="/admin/performance" 
                  className={`px-3 py-2 rounded-md transition-colors ${location === "/admin/performance" ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"}`}
                >
                  Performance
                </Link>
                <Link 
                  href="/admin/resources" 
                  className={`px-3 py-2 rounded-md transition-colors ${location === "/admin/resources" ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"}`}
                >
                  Resources
                </Link>
              </nav>
            )}

            {isStudent && (
              <nav className="hidden md:flex items-center space-x-1 text-sm font-medium">
                <Link 
                  href="/student" 
                  className={`px-3 py-2 rounded-md transition-colors ${location === "/student" ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"}`}
                >
                  Home
                </Link>
                <Link 
                  href="/student/join" 
                  className={`px-3 py-2 rounded-md transition-colors ${location === "/student/join" ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"}`}
                >
                  Join Exam
                </Link>
              </nav>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <ModeToggle />
            {role ? (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild className="hidden sm:flex">
                  <Link href="/profile">
                    <User className="h-4 w-4 mr-2" />
                    {isStudent ? studentProfile?.name || "Profile" : "Admin"}
                  </Link>
                </Button>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Exit
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      </header>
      
      {isAdmin && (
        <div className="md:hidden border-b bg-muted/40">
          <div className="container flex overflow-x-auto py-2 gap-2 hide-scrollbar">
            <Link href="/admin" className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md bg-secondary text-secondary-foreground">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
            <Link href="/admin/exams" className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md text-muted-foreground hover:bg-secondary/50">
              <FileText className="h-4 w-4" />
              Exams
            </Link>
            <Link href="/admin/performance" className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md text-muted-foreground hover:bg-secondary/50">
              <BarChart className="h-4 w-4" />
              Performance
            </Link>
            <Link href="/admin/resources" className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md text-muted-foreground hover:bg-secondary/50">
              <BookOpen className="h-4 w-4" />
              Resources
            </Link>
          </div>
        </div>
      )}

      {isStudent && (
        <div className="md:hidden border-b bg-muted/40">
          <div className="container flex overflow-x-auto py-2 gap-2 hide-scrollbar">
            <Link href="/student" className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md bg-secondary text-secondary-foreground">
              <BookOpen className="h-4 w-4" />
              Home
            </Link>
            <Link href="/student/join" className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md text-muted-foreground hover:bg-secondary/50">
              <GraduationCap className="h-4 w-4" />
              Join Exam
            </Link>
          </div>
        </div>
      )}

      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
