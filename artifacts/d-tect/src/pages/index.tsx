import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { GraduationCap, ShieldCheck } from "lucide-react";
import { useEffect } from "react";

export default function Landing() {
  const [, setLocation] = useLocation();
  const { role, setRole } = useAuth();

  useEffect(() => {
    if (role === "admin") {
      setLocation("/admin");
    } else if (role === "student") {
      setLocation("/student");
    }
  }, [role, setLocation]);

  const handleSelectRole = (selectedRole: "admin" | "student") => {
    setRole(selectedRole);
    setLocation(selectedRole === "admin" ? "/admin" : "/student");
  };

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-background p-6">
      <div className="w-full max-w-3xl flex flex-col items-center animate-in fade-in zoom-in duration-700 slide-in-from-bottom-8">
        
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-primary/5 text-primary mb-6 ring-1 ring-primary/10">
            <ShieldCheck className="w-16 h-16" strokeWidth={1.5} />
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-primary mb-4">
            D-Tect
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-xl mx-auto font-medium">
            Definition & Terminology Assessment Platform
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
          <Button 
            variant="outline" 
            className="h-auto py-12 flex flex-col items-center gap-4 hover:border-primary hover:bg-primary/5 group transition-all"
            onClick={() => handleSelectRole("admin")}
          >
            <ShieldCheck className="w-10 h-10 text-muted-foreground group-hover:text-primary transition-colors" />
            <div className="space-y-1 text-center">
              <h3 className="font-semibold text-lg">Faculty & Admin</h3>
              <p className="text-sm text-muted-foreground">Manage exams and review performance</p>
            </div>
          </Button>

          <Button 
            variant="outline" 
            className="h-auto py-12 flex flex-col items-center gap-4 hover:border-primary hover:bg-primary/5 group transition-all"
            onClick={() => handleSelectRole("student")}
          >
            <GraduationCap className="w-10 h-10 text-muted-foreground group-hover:text-primary transition-colors" />
            <div className="space-y-1 text-center">
              <h3 className="font-semibold text-lg">Student</h3>
              <p className="text-sm text-muted-foreground">Access resources and take exams</p>
            </div>
          </Button>
        </div>
        
        <div className="mt-16 text-sm text-muted-foreground font-medium">
          Secure. Focused. Intelligent.
        </div>
      </div>
    </div>
  );
}
