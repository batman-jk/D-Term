import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useCreateStudent, useJoinExam } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Lock, GraduationCap, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export default function StudentJoin() {
  const { studentProfile, setStudentProfile } = useAuth();
  const [, setLocation] = useLocation();
  
  const [code, setCode] = useState("");
  const [name, setName] = useState(studentProfile?.name || "");
  const [rollNumber, setRollNumber] = useState(studentProfile?.rollNumber || "");
  const [department, setDepartment] = useState(studentProfile?.department || "");

  const createStudent = useCreateStudent();
  const joinExam = useJoinExam();

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !name || !rollNumber || !department) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      // First ensure student exists
      let studentId = studentProfile?.id;
      
      if (!studentId || name !== studentProfile?.name || rollNumber !== studentProfile?.rollNumber) {
        const student = await createStudent.mutateAsync({
          data: { name, rollNumber, department }
        });
        studentId = student.id;
        setStudentProfile(student);
      }

      // Join exam
      const exam = await joinExam.mutateAsync({
        data: {
          code: code.toUpperCase(),
          studentId: studentId
        }
      });

      // Store current exam in session storage to use in the exam interface
      sessionStorage.setItem("dtect_current_exam", JSON.stringify(exam));
      
      toast.success("Joined successfully. Get ready.");
      setLocation("/student/exam");

    } catch (error: any) {
      // Orval default customFetch throws Error object or ErrorType
      toast.error("Invalid code or exam is not active");
    }
  };

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
                />
              </div>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg space-y-4 border">
              <div className="flex items-center gap-2 mb-2 text-sm font-medium text-muted-foreground">
                <GraduationCap className="w-4 h-4" />
                Student Details
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required 
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
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dept">Department</Label>
                  <Input 
                    id="dept" 
                    value={department} 
                    onChange={(e) => setDepartment(e.target.value)} 
                    required 
                  />
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="pb-8">
            <Button 
              type="submit" 
              className="w-full h-12 text-lg font-medium"
              disabled={createStudent.isPending || joinExam.isPending || code.length < 3}
            >
              {(createStudent.isPending || joinExam.isPending) ? "Connecting..." : "Begin Assessment"}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
