import { useAuth } from "@/hooks/use-auth";
import { useListResources, getListResourcesQueryKey, useListExams } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { BookOpen, FileText, Link as LinkIcon, ExternalLink, GraduationCap } from "lucide-react";
import { useEffect } from "react";

export default function StudentHome() {
  const { studentProfile } = useAuth();
  const [, setLocation] = useLocation();
  const { data: resources, isLoading } = useListResources({}, { query: { queryKey: getListResourcesQueryKey({}) } });
  const { data: exams } = useListExams();

  useEffect(() => {
    if (!studentProfile) {
      setLocation("/student/login");
    }
  }, [studentProfile, setLocation]);

  if (!studentProfile) return null;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "link": return <LinkIcon className="w-4 h-4 text-blue-500" />;
      case "pdf": return <FileText className="w-4 h-4 text-red-500" />;
      default: return <BookOpen className="w-4 h-4 text-amber-500" />;
    }
  };

  // Group resources by exam
  const groupedResources = resources?.reduce((acc, resource) => {
    const exam = exams?.find(e => e.id === resource.examId);
    const examName = exam?.title || `Exam #${resource.examId}`;
    
    if (!acc[examName]) {
      acc[examName] = [];
    }
    acc[examName].push(resource);
    return acc;
  }, {} as Record<string, typeof resources>);

  return (
    <div className="container py-8 space-y-8 max-w-5xl">
      <div className="flex flex-col md:flex-row gap-6 items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Student Portal</h1>
          <p className="text-muted-foreground mt-1">Access your study materials and exams.</p>
        </div>
        
        <Card className="w-full md:w-80 bg-primary text-primary-foreground shadow-md border-0">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{studentProfile.name}</h3>
                <p className="text-primary-foreground/80 text-sm">{studentProfile.rollNumber} • {studentProfile.department}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-secondary/50 border rounded-xl p-6 md:p-8 flex flex-col items-center justify-center text-center">
        <h2 className="text-xl font-semibold mb-2">Ready for an assessment?</h2>
        <p className="text-muted-foreground mb-6 max-w-md">
          When faculty announces a secret code, enter it here to access your exam securely.
        </p>
        <Button size="lg" className="w-full sm:w-auto text-base px-8 h-12" asChild>
          <Link href="/student/join">Join Exam with Code</Link>
        </Button>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-2 border-b pb-2">
          <BookOpen className="w-5 h-5 text-primary" />
          <h2 className="text-2xl font-semibold">Study Materials</h2>
        </div>

        {isLoading ? (
          <div className="space-y-8">
            <div className="h-8 bg-muted rounded w-48 animate-pulse"></div>
            <div className="grid gap-4 md:grid-cols-2">
              {[1, 2].map(i => <div key={i} className="h-32 bg-muted rounded-xl animate-pulse"></div>)}
            </div>
          </div>
        ) : !groupedResources || Object.keys(groupedResources).length === 0 ? (
          <div className="text-center py-12 border rounded-xl bg-muted/10">
            <p className="text-muted-foreground">No study resources have been posted yet.</p>
          </div>
        ) : (
          <div className="space-y-10">
            {Object.entries(groupedResources).map(([examName, examResources]) => (
              <div key={examName} className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground/80">{examName}</h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {examResources.map(resource => (
                    <Card key={resource.id} className="hover:border-primary/30 transition-colors">
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider mb-2">
                          {getTypeIcon(resource.type)}
                          <span className="text-muted-foreground">{resource.type}</span>
                        </div>
                        <CardTitle className="text-base leading-tight">{resource.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                          {resource.content}
                        </p>
                        {resource.url && (
                          <Button variant="secondary" size="sm" className="w-full text-xs" asChild>
                            <a href={resource.url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-3 h-3 mr-2" />
                              Open Resource
                            </a>
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
