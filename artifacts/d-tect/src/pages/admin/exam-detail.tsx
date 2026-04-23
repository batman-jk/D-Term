import { 
  useGetExam, getGetExamQueryKey, 
  useUpdateExam, 
  useGenerateExamCode, 
  useListQuestions, getListQuestionsQueryKey, 
  useCreateQuestion, 
  useDeleteQuestion 
} from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, Key, Plus, Trash2, Edit2, PlayCircle, Settings, CheckCircle } from "lucide-react";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminExamDetail() {
  const { id } = useParams<{ id: string }>();
  const examId = parseInt(id || "0", 10);
  const queryClient = useQueryClient();

  const [isAddQuestionOpen, setIsAddQuestionOpen] = useState(false);
  const [qText, setQText] = useState("");
  const [qOptions, setQOptions] = useState(["", "", "", ""]);
  const [qCorrect, setQCorrect] = useState("0");

  const { data: exam, isLoading: examLoading } = useGetExam(examId, {
    query: {
      enabled: !!examId,
      queryKey: getGetExamQueryKey(examId)
    }
  });

  const { data: questions, isLoading: questionsLoading } = useListQuestions(
    { examId },
    {
      query: {
        enabled: !!examId,
        queryKey: getListQuestionsQueryKey({ examId })
      }
    }
  );

  const updateExam = useUpdateExam();
  const generateCode = useGenerateExamCode();
  const createQuestion = useCreateQuestion();
  const deleteQuestion = useDeleteQuestion();

  if (examLoading) {
    return <div className="container py-8"><Skeleton className="h-10 w-1/3 mb-8" /></div>;
  }

  if (!exam) {
    return (
      <div className="container py-8 text-center">
        <h2 className="text-2xl font-bold">Exam not found</h2>
        <Button variant="link" asChild className="mt-4"><Link href="/admin/exams">Go back to exams</Link></Button>
      </div>
    );
  }

  const handleStatusChange = async (status: "draft" | "active" | "past") => {
    try {
      await updateExam.mutateAsync({
        id: examId,
        data: { status }
      });
      toast.success(`Exam marked as ${status}`);
      queryClient.invalidateQueries({ queryKey: getGetExamQueryKey(examId) });
      queryClient.invalidateQueries({ queryKey: ["/api/exams"] }); // Invalidate list
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleGenerateCode = async () => {
    try {
      await generateCode.mutateAsync({ id: examId });
      toast.success("New access code generated");
      queryClient.invalidateQueries({ queryKey: getGetExamQueryKey(examId) });
    } catch (error) {
      toast.error("Failed to generate code");
    }
  };

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qText.trim()) return;
    
    if (exam.type === "mcq") {
      const validOptions = qOptions.filter(o => o.trim() !== "");
      if (validOptions.length < 2) {
        toast.error("MCQ requires at least 2 options");
        return;
      }
      if (!qOptions[parseInt(qCorrect)]) {
        toast.error("Correct answer cannot be empty");
        return;
      }
    }

    try {
      await createQuestion.mutateAsync({
        data: {
          examId,
          questionText: qText,
          type: exam.type,
          options: exam.type === "mcq" ? qOptions : null,
          correctAnswer: exam.type === "mcq" ? qOptions[parseInt(qCorrect)] : null,
          orderIndex: (questions?.length || 0) + 1
        }
      });
      
      toast.success("Question added");
      setIsAddQuestionOpen(false);
      setQText("");
      setQOptions(["", "", "", ""]);
      setQCorrect("0");
      queryClient.invalidateQueries({ queryKey: getListQuestionsQueryKey({ examId }) });
    } catch (error) {
      toast.error("Failed to add question");
    }
  };

  const handleDeleteQuestion = async (qId: number) => {
    if (!confirm("Remove this question?")) return;
    try {
      await deleteQuestion.mutateAsync({ id: qId });
      toast.success("Question removed");
      queryClient.invalidateQueries({ queryKey: getListQuestionsQueryKey({ examId }) });
    } catch (error) {
      toast.error("Failed to remove question");
    }
  };

  return (
    <div className="container py-8 space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2 mb-2 text-muted-foreground">
        <Link href="/admin/exams">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Exams
        </Link>
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Exam Details & Controls */}
        <div className="space-y-6 lg:col-span-1">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl">{exam.title}</CardTitle>
                <Badge variant={exam.status === "active" ? "default" : exam.status === "draft" ? "secondary" : "outline"}>
                  {exam.status}
                </Badge>
              </div>
              <CardDescription className="mt-2">{exam.description || "No description."}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Type</p>
                  <p className="font-medium uppercase">{exam.type}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Submissions</p>
                  <p className="font-medium">{exam.submissionCount}</p>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-secondary/50 border space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-primary" />
                    Access Code
                  </Label>
                </div>
                {exam.secretCode ? (
                  <div className="text-3xl font-mono tracking-widest text-center py-4 bg-background border rounded-md shadow-inner">
                    {exam.secretCode}
                  </div>
                ) : (
                  <div className="text-sm text-center py-4 text-muted-foreground bg-background border rounded-md border-dashed">
                    No code generated yet
                  </div>
                )}
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={handleGenerateCode}
                  disabled={generateCode.isPending}
                >
                  {generateCode.isPending ? "Generating..." : "Generate New Code"}
                </Button>
              </div>

              <div className="space-y-2 pt-4 border-t">
                <Label>Exam Status</Label>
                <Select 
                  value={exam.status} 
                  onValueChange={(v: "draft" | "active" | "past") => handleStatusChange(v)}
                  disabled={updateExam.isPending}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Change status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft (Editing)</SelectItem>
                    <SelectItem value="active">Active (Accepting Submissions)</SelectItem>
                    <SelectItem value="past">Past (Closed)</SelectItem>
                  </SelectContent>
                </Select>
                {exam.status === "active" && (
                  <p className="text-xs text-green-600 flex items-center mt-2">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Students can join and submit
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Questions */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between bg-muted/40 p-4 rounded-lg border">
            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2">
                Questions
                <Badge variant="secondary" className="ml-2">{questions?.length || 0}</Badge>
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {exam.type === "mcq" ? "Multiple choice questions" : "Open-ended questions"}
              </p>
            </div>
            <Dialog open={isAddQuestionOpen} onOpenChange={setIsAddQuestionOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" /> Add Question
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <form onSubmit={handleAddQuestion}>
                  <DialogHeader>
                    <DialogTitle>Add {exam.type.toUpperCase()} Question</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Question Text</Label>
                      <Textarea 
                        value={qText} 
                        onChange={(e) => setQText(e.target.value)} 
                        placeholder="Type the question here..."
                        required
                        className="min-h-[100px]"
                      />
                    </div>

                    {exam.type === "mcq" && (
                      <div className="space-y-3 border p-4 rounded-md bg-muted/20">
                        <Label>Options</Label>
                        {qOptions.map((opt, idx) => (
                          <div key={idx} className="flex items-center gap-3">
                            <input 
                              type="radio" 
                              name="correct" 
                              value={idx}
                              checked={qCorrect === idx.toString()}
                              onChange={(e) => setQCorrect(e.target.value)}
                              className="w-4 h-4 text-primary"
                            />
                            <Input 
                              placeholder={`Option ${idx + 1}`}
                              value={opt}
                              onChange={(e) => {
                                const newOpts = [...qOptions];
                                newOpts[idx] = e.target.value;
                                setQOptions(newOpts);
                              }}
                            />
                          </div>
                        ))}
                        <p className="text-xs text-muted-foreground mt-2">
                          Select the radio button next to the correct answer.
                        </p>
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsAddQuestionOpen(false)}>Cancel</Button>
                    <Button type="submit" disabled={createQuestion.isPending || !qText.trim()}>Save Question</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-3">
            {questionsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full" />)}
              </div>
            ) : questions?.length === 0 ? (
              <div className="text-center py-12 border border-dashed rounded-lg">
                <p className="text-muted-foreground">No questions added yet.</p>
                <Button variant="outline" className="mt-4" onClick={() => setIsAddQuestionOpen(true)}>
                  Add First Question
                </Button>
              </div>
            ) : (
              questions?.map((q, index) => (
                <Card key={q.id} className="relative overflow-hidden group">
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary/20 group-hover:bg-primary transition-colors" />
                  <CardContent className="p-5 pl-6 flex justify-between gap-4">
                    <div className="space-y-3 flex-1">
                      <div className="font-medium text-sm text-muted-foreground">Question {index + 1}</div>
                      <p className="text-base whitespace-pre-wrap">{q.questionText}</p>
                      
                      {q.type === "mcq" && q.options && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
                          {q.options.map((opt, i) => (
                            <div 
                              key={i} 
                              className={`p-2 text-sm rounded-md border ${opt === q.correctAnswer ? 'bg-primary/10 border-primary border-dashed font-medium text-primary' : 'bg-muted/50'}`}
                            >
                              {opt}
                              {opt === q.correctAnswer && <CheckCircle className="inline w-3.5 h-3.5 ml-2" />}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => handleDeleteQuestion(q.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
