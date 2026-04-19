import { useListResources, getListResourcesQueryKey, useListExams, useCreateResource, useDeleteResource } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { BookOpen, FileText, Link as LinkIcon, Trash2, Plus, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function AdminResources() {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedExamId, setSelectedExamId] = useState<string>("all");
  
  // Form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState<"note" | "link" | "pdf">("note");
  const [url, setUrl] = useState("");
  const [formExamId, setFormExamId] = useState("");

  const { data: exams } = useListExams();
  const { data: resources, isLoading } = useListResources(
    selectedExamId !== "all" ? { examId: parseInt(selectedExamId) } : {},
    { query: { queryKey: getListResourcesQueryKey(selectedExamId !== "all" ? { examId: parseInt(selectedExamId) } : {}) } }
  );

  const createResource = useCreateResource();
  const deleteResource = useDeleteResource();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content || !formExamId) return;

    try {
      await createResource.mutateAsync({
        data: {
          title,
          content,
          type,
          url: (type === "link" || type === "pdf") ? url : null,
          examId: parseInt(formExamId)
        }
      });
      
      toast.success("Resource added successfully");
      setIsCreateOpen(false);
      setTitle("");
      setContent("");
      setType("note");
      setUrl("");
      setFormExamId("");
      queryClient.invalidateQueries({ queryKey: getListResourcesQueryKey() });
    } catch (error) {
      toast.error("Failed to add resource");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this resource?")) return;
    try {
      await deleteResource.mutateAsync({ id });
      toast.success("Resource deleted");
      queryClient.invalidateQueries({ queryKey: getListResourcesQueryKey() });
    } catch (error) {
      toast.error("Failed to delete resource");
    }
  };

  const getTypeIcon = (resourceType: string) => {
    switch (resourceType) {
      case "link": return <LinkIcon className="w-4 h-4 text-blue-500" />;
      case "pdf": return <FileText className="w-4 h-4 text-red-500" />;
      default: return <BookOpen className="w-4 h-4 text-amber-500" />;
    }
  };

  return (
    <div className="container py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Study Resources</h1>
          <p className="text-muted-foreground mt-1">Manage preparation materials for students.</p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Resource
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <form onSubmit={handleCreate}>
              <DialogHeader>
                <DialogTitle>Add Study Resource</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label>Target Exam</Label>
                  <Select value={formExamId} onValueChange={setFormExamId} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select exam" />
                    </SelectTrigger>
                    <SelectContent>
                      {exams?.map(exam => (
                        <SelectItem key={exam.id} value={exam.id.toString()}>{exam.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Resource Title</Label>
                  <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Chapter 4 Summary" required />
                </div>

                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={type} onValueChange={(v: any) => setType(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="note">Text Note</SelectItem>
                      <SelectItem value="link">External Link</SelectItem>
                      <SelectItem value="pdf">PDF Link</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {(type === "link" || type === "pdf") && (
                  <div className="space-y-2">
                    <Label>URL</Label>
                    <Input type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://..." required />
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Description / Content</Label>
                  <Textarea 
                    value={content} 
                    onChange={e => setContent(e.target.value)} 
                    placeholder={type === "note" ? "Write the full note here..." : "Brief description of the link..."}
                    required
                    className={type === "note" ? "min-h-[150px]" : ""}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createResource.isPending}>Save Resource</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-2 max-w-sm">
        <Label className="shrink-0">Filter by Exam:</Label>
        <Select value={selectedExamId} onValueChange={setSelectedExamId}>
          <SelectTrigger>
            <SelectValue placeholder="All Exams" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Exams</SelectItem>
            {exams?.map(exam => (
              <SelectItem key={exam.id} value={exam.id.toString()}>{exam.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2"><div className="h-5 bg-muted rounded w-3/4"></div></CardHeader>
              <CardContent><div className="h-16 bg-muted rounded"></div></CardContent>
            </Card>
          ))
        ) : resources?.length === 0 ? (
          <div className="col-span-full text-center py-12 border rounded-lg bg-muted/20">
            <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground">No resources found for the selected criteria.</p>
          </div>
        ) : (
          resources?.map((resource) => (
            <Card key={resource.id} className="flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 w-full">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">
                      {getTypeIcon(resource.type)}
                      {resource.type}
                    </div>
                    <CardTitle className="text-base leading-tight">{resource.title}</CardTitle>
                    <p className="text-xs text-primary/70 line-clamp-1">
                      Exam ID: {resource.examId}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm text-muted-foreground line-clamp-4">
                  {resource.content}
                </p>
                {resource.url && (
                  <a href={resource.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-xs text-blue-500 hover:underline mt-3 font-medium">
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Open Link
                  </a>
                )}
              </CardContent>
              <CardFooter className="pt-4 border-t flex justify-between">
                <span className="text-xs text-muted-foreground">
                  {format(new Date(resource.createdAt), "MMM d, yyyy")}
                </span>
                <Button variant="ghost" size="icon" className="text-destructive h-8 w-8 hover:bg-destructive/10 hover:text-destructive" onClick={() => handleDelete(resource.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
