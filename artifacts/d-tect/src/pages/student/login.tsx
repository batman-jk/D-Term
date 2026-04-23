import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useCreateStudent } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { GraduationCap, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export default function StudentLogin() {
  const { role, studentProfile, setStudentProfile } = useAuth();
  const [, setLocation] = useLocation();
  
  const [name, setName] = useState(studentProfile?.name || "");
  const [rollNumber, setRollNumber] = useState(studentProfile?.rollNumber || "");
  const [department, setDepartment] = useState(studentProfile?.department || "");

  const createStudent = useCreateStudent();

  useEffect(() => {
    if (role !== "student") {
      setLocation("/role-selection");
    } else if (studentProfile) {
      setLocation("/student");
    }
  }, [role, studentProfile, setLocation]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !rollNumber || !department) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      const student = await createStudent.mutateAsync({
        data: { name, rollNumber, department }
      });
      setStudentProfile(student);
      toast.success("Welcome, access granted.");
      setLocation("/student");
    } catch (error: any) {
      toast.error("Failed to authenticate details.");
    }
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center p-4 bg-muted/20">
      <Card className="w-full max-w-md shadow-lg border-primary/10">
        <CardHeader className="text-center pb-8 pt-10">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <GraduationCap className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Student Access</CardTitle>
          <CardDescription className="text-base mt-2">
            Enter your details to access study materials and exams
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-6">
            <div className="space-y-4 rounded-lg">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required 
                  placeholder="John Doe"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="roll">Roll Number</Label>
                  <Input 
                    id="roll" 
                    value={rollNumber} 
                    onChange={(e) => setRollNumber(e.target.value)} 
                    required 
                    placeholder="20XX01"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dept">Department</Label>
                  <Input 
                    id="dept" 
                    value={department} 
                    onChange={(e) => setDepartment(e.target.value)} 
                    required 
                    placeholder="CSE"
                  />
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="pb-8 pt-4">
            <Button 
              type="submit" 
              className="w-full h-12 text-lg font-medium"
              disabled={createStudent.isPending}
            >
              {createStudent.isPending ? "Authenticating..." : "Enter Portal"}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
