import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useJoinExam } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Lock, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export default function StudentJoin() {
  const { role, studentProfile } = useAuth();
  const [, setLocation] = useLocation();
  
  const [code, setCode] = useState("");
  const joinExam = useJoinExam();

  useEffect(() => {
    if (role !== "student") {
      setLocation("/role-selection");
    } else if (!studentProfile) {
      setLocation("/student/login");
    }
  }, [role, studentProfile, setLocation]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || code.length < 3) {
      toast.error("Please enter a valid code");
      return;
    }

    if (!studentProfile?.id) {
      toast.error("Student profile missing. Please log in.");
      setLocation("/student/login");
      return;
    }

    try {
      // Join exam
      const exam = await joinExam.mutateAsync({
        data: {
          code: code.toUpperCase(),
          studentId: studentProfile.id
        }
      });

      // Store current exam in session storage to use in the exam interface
      sessionStorage.setItem("dtect_current_exam", JSON.stringify(exam));
      
      toast.success("Joined successfully. Get ready.");
      setLocation("/student/exam");

    } catch (error: any) {
      toast.error("Invalid code or exam is not active");
    }
  };

  if (!studentProfile) return null;

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center p-4 bg-muted/20">
      <Card className="w-full max-w-md shadow-lg border-primary/10">
        <CardHeader className="text-center pb-8 pt-10">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Join Assessment</CardTitle>
          <CardDescription className="text-base mt-2">
            Enter the secret code provided by your faculty
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleJoin}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-center">
                <Input
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="ENTER 6-CHAR CODE"
                  className="text-center text-2xl font-mono tracking-[0.5em] h-16 uppercase placeholder:text-muted-foreground/50 border-2"
                  maxLength={6}
                  required
                  autoFocus
                />
              </div>
            </div>
            
            <div className="text-sm text-center text-muted-foreground px-4">
              Joining as <span className="font-semibold text-foreground">{studentProfile.name}</span> ({studentProfile.rollNumber})
            </div>
          </CardContent>
          <CardFooter className="pb-8">
            <Button 
              type="submit" 
              className="w-full h-12 text-lg font-medium"
              disabled={joinExam.isPending || code.length < 3}
            >
              {joinExam.isPending ? "Connecting..." : "Begin Assessment"}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
