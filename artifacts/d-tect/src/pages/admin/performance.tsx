import { useGetStudentPerformance, getGetStudentPerformanceQueryKey, useUpdateSubmissionScore, useGetStatsOverview } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { format } from "date-fns";

export default function AdminPerformance() {
  const queryClient = useQueryClient();
  const { data: performanceData, isLoading } = useGetStudentPerformance({
    query: {
      queryKey: getGetStudentPerformanceQueryKey()
    }
  });

  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<number | null>(null);
  const [scoreInput, setScoreInput] = useState<string>("");
  
  const updateScore = useUpdateSubmissionScore();

  const handleScoreSubmit = async (submissionId: number) => {
    const score = parseFloat(scoreInput);
    if (isNaN(score) || score < 0 || score > 5) {
      toast.error("Score must be between 0 and 5");
      return;
    }

    try {
      await updateScore.mutateAsync({
        id: submissionId,
        data: { score }
      });
      toast.success("Score updated successfully");
      queryClient.invalidateQueries({ queryKey: getGetStudentPerformanceQueryKey() });
      queryClient.invalidateQueries({ queryKey: ["/api/stats/overview"] });
    } catch (error) {
      toast.error("Failed to update score");
    }
  };

  const selectedStudent = performanceData?.find(p => p.studentId === selectedStudentId);

  return (
    <div className="container py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Student Performance</h1>
        <p className="text-muted-foreground mt-1">Review submissions and assign scores.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Performance Overview</CardTitle>
          <CardDescription>All registered students and their aggregate scores.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Roll Number</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead className="text-center">Exams Taken</TableHead>
                    <TableHead className="text-right">Average Score</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {performanceData?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No students found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    performanceData?.map((student) => (
                      <TableRow key={student.studentId}>
                        <TableCell className="font-medium">{student.studentName}</TableCell>
                        <TableCell>{student.rollNumber}</TableCell>
                        <TableCell>{student.department}</TableCell>
                        <TableCell className="text-center">{student.totalExamsTaken}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline" className={student.averageScore >= 3 ? "text-green-600" : "text-amber-600"}>
                            {student.averageScore.toFixed(1)} / 5
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="secondary" 
                            size="sm"
                            onClick={() => setSelectedStudentId(student.studentId)}
                          >
                            View Submissions
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedStudentId} onOpenChange={(open) => !open && setSelectedStudentId(null)}>
        <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{selectedStudent?.studentName}'s Submissions</DialogTitle>
            <DialogDescription>
              {selectedStudent?.rollNumber} • {selectedStudent?.department}
            </DialogDescription>
          </DialogHeader>

          <div className="overflow-y-auto flex-1 pr-2 space-y-6 py-4">
            {selectedStudent?.submissions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No submissions yet.</p>
            ) : (
              selectedStudent?.submissions.map((sub) => (
                <Card key={sub.id} className="border-border">
                  <CardHeader className="bg-muted/30 pb-4 border-b">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{sub.examTitle}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          Submitted: {format(new Date(sub.submittedAt), "PPP 'at' p")}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {sub.score !== null ? (
                          <Badge className="text-sm px-3 py-1">Score: {sub.score} / 5</Badge>
                        ) : (
                          <Badge variant="outline" className="text-amber-500 border-amber-300">Pending Score</Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-8">
                    <div className="space-y-6">
                      {sub.answers.map((ans, i) => (
                        <div key={ans.questionId} className="space-y-2">
                          <div className="font-medium text-sm">
                            <span className="text-muted-foreground mr-2">Q{i+1}.</span>
                            {ans.questionText}
                          </div>
                          <div className="bg-muted/30 p-3 rounded-md border text-sm whitespace-pre-wrap font-mono">
                            {ans.answer || <span className="text-muted-foreground italic">No answer provided</span>}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-6 border-t flex items-center justify-between bg-primary/5 -mx-6 -mb-6 p-6 rounded-b-lg">
                      <div>
                        <Label className="text-base">Assign Score (0-5)</Label>
                        <p className="text-xs text-muted-foreground mt-1">Update or assign a new score</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Input 
                          type="number" 
                          min="0" 
                          max="5" 
                          step="0.5"
                          className="w-24 text-center text-lg font-bold"
                          placeholder={sub.score?.toString() || "-"}
                          onChange={(e) => {
                            setSelectedSubmissionId(sub.id);
                            setScoreInput(e.target.value);
                          }}
                          onFocus={() => {
                            setSelectedSubmissionId(sub.id);
                            setScoreInput(sub.score?.toString() || "");
                          }}
                        />
                        <Button 
                          onClick={() => handleScoreSubmit(sub.id)}
                          disabled={updateScore.isPending || selectedSubmissionId !== sub.id || !scoreInput}
                        >
                          Save
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
