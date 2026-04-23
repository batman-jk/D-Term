import { useListExams, getListExamsQueryKey, useCreateExam, useDeleteExam } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, FileText, Search } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { format } from "date-fns";
import { toast } from "sonner";
// types removed

export default function AdminExams() {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [search, setSearch] = useState("");
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"mcq" | "qa">("mcq");

  const { data: exams, isLoading } = useListExams();
  const createExam = useCreateExam();
  const deleteExam = useDeleteExam();

  const filteredExams = exams?.filter(exam => 
    exam.title.toLowerCase().includes(search.toLowerCase()) ||
    (exam.description && exam.description.toLowerCase().includes(search.toLowerCase()))
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      await createExam.mutateAsync({
        data: {
          title,
          description,
          type
        }
      });
      
      toast.success("Exam created successfully");
      setIsCreateOpen(false);
      setTitle("");
      setDescription("");
      setType("mcq");
      queryClient.invalidateQueries({ queryKey: getListExamsQueryKey() });
    } catch (error) {
      toast.error("Failed to create exam");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this exam?")) return;
    
    try {
      await deleteExam.mutateAsync({ id });
      toast.success("Exam deleted");
      queryClient.invalidateQueries({ queryKey: getListExamsQueryKey() });
    } catch (error) {
      toast.error("Failed to delete exam");
    }
  };

  const getStatusBadge = (status: "draft" | "active" | "past") => {
    switch (status) {
      case "active":
        return <Badge variant="default" className="bg-green-600 hover:bg-green-700">Active</Badge>;
      case "draft":
        return <Badge variant="secondary">Draft</Badge>;
      case "past":
        return <Badge variant="outline" className="text-muted-foreground">Past</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="container py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Exams</h1>
          <p className="text-muted-foreground mt-1">Manage assessments, questions, and view stats.</p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Exam
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleCreate}>
              <DialogHeader>
                <DialogTitle>Create New Exam</DialogTitle>
                <DialogDescription>
                  Define a new assessment. You can add questions later.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Exam Title</Label>
                  <Input 
                    id="title" 
                    placeholder="e.g. Midterm: Data Structures" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Instructions or topic summary..." 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Exam Type</Label>
                  <Select value={type} onValueChange={(v: "mcq" | "qa") => setType(v)}>
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mcq">Multiple Choice (MCQ)</SelectItem>
                      <SelectItem value="qa">Open Answer (Q&A)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createExam.isPending || !title.trim()}>
                  {createExam.isPending ? "Creating..." : "Create Exam"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-2 max-w-sm">
        <Search className="w-4 h-4 text-muted-foreground" />
        <Input 
          placeholder="Search exams..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
        />
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-4">
                <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredExams?.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-muted/20">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium">No exams found</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {search ? "Try adjusting your search query." : "Create your first exam to get started."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredExams?.map((exam) => (
            <Card key={exam.id} className="flex flex-col group hover:border-primary/50 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-xl line-clamp-1" title={exam.title}>{exam.title}</CardTitle>
                    <CardDescription>
                      {format(new Date(exam.createdAt), "MMM d, yyyy")}
                    </CardDescription>
                  </div>
                  {getStatusBadge(exam.status)}
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">
                  {exam.description || "No description provided."}
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
                  <Badge variant="outline" className="font-normal text-xs uppercase tracking-wider">
                    {exam.type === "mcq" ? "MCQ" : "Q&A"}
                  </Badge>
                  <Badge variant="outline" className="font-normal text-xs">
                    {exam.questionCount} Questions
                  </Badge>
                  <Badge variant="outline" className="font-normal text-xs">
                    {exam.submissionCount} Submissions
                  </Badge>
                </div>
              </CardContent>
              <CardFooter className="pt-4 border-t gap-2">
                <Button variant="secondary" className="flex-1" asChild>
                  <Link href={`/admin/exams/${exam.id}`}>Manage</Link>
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                  onClick={() => handleDelete(exam.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
