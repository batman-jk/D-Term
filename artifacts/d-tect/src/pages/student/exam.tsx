import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useCreateSubmission } from "@workspace/api-client-react";
import { ExamWithQuestions } from "@workspace/api-client-react/src/generated/api.schemas";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { AlertCircle, Maximize, ShieldAlert, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function StudentExam() {
  const { studentProfile } = useAuth();
  const [, setLocation] = useLocation();
  const [exam, setExam] = useState<ExamWithQuestions | null>(null);
  
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  
  const createSubmission = useCreateSubmission();
  const examContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!studentProfile) {
      setLocation("/student/join");
      return;
    }

    const storedExam = sessionStorage.getItem("dtect_current_exam");
    if (!storedExam) {
      setLocation("/student/join");
      return;
    }

    setExam(JSON.parse(storedExam));

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    
    // Auto-request fullscreen on mount
    const requestFS = async () => {
      try {
        if (!document.fullscreenElement) {
          await document.documentElement.requestFullscreen();
        }
      } catch (err) {
        console.error("Fullscreen request failed", err);
      }
    };
    
    // Slight delay to allow DOM to render before requesting
    const timer = setTimeout(requestFS, 100);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      clearTimeout(timer);
    };
  }, [studentProfile, setLocation]);

  const requestFullscreen = async () => {
    try {
      await document.documentElement.requestFullscreen();
    } catch (err) {
      toast.error("Could not enter fullscreen mode");
    }
  };

  const handleAnswer = (questionId: number, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleSubmit = async () => {
    if (!exam || !studentProfile) return;

    if (!confirm("Are you sure you want to submit your answers? You cannot return to this exam.")) {
      return;
    }

    const formattedAnswers = Object.entries(answers).map(([qId, ans]) => ({
      questionId: parseInt(qId),
      answer: ans
    }));

    try {
      await createSubmission.mutateAsync({
        data: {
          examId: exam.id,
          studentId: studentProfile.id,
          answers: formattedAnswers
        }
      });

      // Exit fullscreen gracefully
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }

      sessionStorage.removeItem("dtect_current_exam");
      setLocation("/student/results");
      toast.success("Exam submitted successfully");
    } catch (error) {
      toast.error("Failed to submit exam");
    }
  };

  if (!exam) return null;

  // Render blocked state if not fullscreen
  if (!isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center p-6 text-center">
        <ShieldAlert className="w-24 h-24 text-destructive mb-6" strokeWidth={1} />
        <h1 className="text-3xl font-bold mb-2">Focus Mode Required</h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-md">
          This assessment requires full screen to prevent distractions. Exiting fullscreen pauses the exam.
        </p>
        <Button size="lg" onClick={requestFullscreen} className="h-14 px-8 text-lg">
          <Maximize className="w-5 h-5 mr-2" />
          Resume Assessment
        </Button>
      </div>
    );
  }

  const questions = exam.questions;
  const currentQ = questions[currentQIndex];
  const isLastQ = currentQIndex === questions.length - 1;
  const totalAnswered = Object.keys(answers).length;
  const progress = (totalAnswered / questions.length) * 100;

  return (
    <div className="fixed inset-0 bg-background z-40 overflow-hidden flex flex-col" ref={examContainerRef}>
      {/* Exam Header */}
      <header className="border-b bg-card px-6 py-4 flex items-center justify-between shrink-0">
        <div>
          <h2 className="font-bold text-lg">{exam.title}</h2>
          <p className="text-sm text-muted-foreground">{studentProfile?.name} • {studentProfile?.rollNumber}</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-sm font-medium">
            <span className="text-primary">{totalAnswered}</span> / {questions.length} Answered
          </div>
          <Button variant="destructive" onClick={handleSubmit}>Submit Final</Button>
        </div>
      </header>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-secondary shrink-0">
        <div 
          className="h-full bg-primary transition-all duration-300" 
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Question Area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-12">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0 mt-1">
                {currentQIndex + 1}
              </div>
              <div className="space-y-6 flex-1">
                <h3 className="text-2xl font-medium leading-relaxed">
                  {currentQ.questionText}
                </h3>
                
                <div className="pt-4">
                  {exam.type === "mcq" && currentQ.options ? (
                    <RadioGroup 
                      value={answers[currentQ.id] || ""} 
                      onValueChange={(val) => handleAnswer(currentQ.id, val)}
                      className="space-y-3"
                    >
                      {currentQ.options.map((opt, idx) => (
                        <div key={idx} className="flex items-center space-x-2 border p-4 rounded-lg hover:bg-muted/50 transition-colors [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/5">
                          <RadioGroupItem value={opt} id={`opt-${idx}`} className="w-5 h-5" />
                          <Label htmlFor={`opt-${idx}`} className="flex-1 text-base cursor-pointer font-normal leading-relaxed">{opt}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  ) : (
                    <Textarea 
                      value={answers[currentQ.id] || ""}
                      onChange={(e) => handleAnswer(currentQ.id, e.target.value)}
                      placeholder="Type your comprehensive answer here..."
                      className="min-h-[300px] text-base leading-relaxed p-4 resize-none focus-visible:ring-primary font-mono"
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-12 border-t mt-12">
              <Button 
                variant="outline" 
                size="lg"
                disabled={currentQIndex === 0}
                onClick={() => setCurrentQIndex(prev => prev - 1)}
              >
                Previous
              </Button>
              
              {isLastQ ? (
                <Button size="lg" onClick={handleSubmit}>
                  Complete & Submit
                </Button>
              ) : (
                <Button 
                  size="lg"
                  onClick={() => setCurrentQIndex(prev => prev + 1)}
                >
                  Next Question
                </Button>
              )}
            </div>
          </div>
        </main>

        {/* Sidebar Navigation */}
        <aside className="w-64 border-l bg-card flex flex-col shrink-0">
          <div className="p-4 border-b font-semibold text-sm text-muted-foreground uppercase tracking-wider">
            Question Navigator
          </div>
          <div className="flex-1 overflow-y-auto p-4 content-start">
            <div className="grid grid-cols-4 gap-2">
              {questions.map((q, idx) => {
                const isAnswered = !!answers[q.id];
                const isCurrent = idx === currentQIndex;
                
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQIndex(idx)}
                    className={`
                      h-10 rounded-md text-sm font-medium transition-all flex items-center justify-center relative
                      ${isCurrent ? 'ring-2 ring-primary ring-offset-2' : ''}
                      ${isAnswered ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-muted border'}
                    `}
                  >
                    {idx + 1}
                    {isAnswered && <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-primary rounded-full" />}
                  </button>
                );
              })}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
