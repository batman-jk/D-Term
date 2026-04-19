import { useGetStatsOverview, getGetStatsOverviewQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Users, CheckCircle2, TrendingUp, AlertCircle, BarChart, BookOpen } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";

export default function AdminDashboard() {
  const { data: stats, isLoading, error } = useGetStatsOverview({
    query: {
      queryKey: getGetStatsOverviewQueryKey()
    }
  });

  if (error) {
    return (
      <div className="container py-10">
        <div className="rounded-lg border border-destructive/50 p-6 bg-destructive/10 text-destructive flex items-start gap-3">
          <AlertCircle className="w-5 h-5 mt-0.5" />
          <div>
            <h3 className="font-semibold">Failed to load dashboard</h3>
            <p className="text-sm opacity-90">Please ensure the backend is running.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Overview of D-Tect system activity and performance.</p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-4 rounded-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-3 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : stats ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Exams</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalExams}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Across all statuses
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Exams</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeExams}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Currently running
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStudents}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Registered in system
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Submissions</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSubmissions}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Total tests taken
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageScore.toFixed(1)}<span className="text-sm text-muted-foreground font-normal">/5</span></div>
              <p className="text-xs text-muted-foreground mt-1">
                Across all submissions
              </p>
            </CardContent>
          </Card>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-6 w-16" />
                  </div>
                ))}
              </div>
            ) : stats?.recentSubmissions?.length ? (
              <div className="space-y-4">
                {stats.recentSubmissions.map((sub) => (
                  <div key={sub.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">{sub.studentName}</p>
                      <div className="flex items-center text-xs text-muted-foreground gap-2">
                        <span>{sub.examTitle}</span>
                        <span>•</span>
                        <span>{format(new Date(sub.submittedAt), "MMM d, h:mm a")}</span>
                      </div>
                    </div>
                    <div>
                      {sub.score !== null ? (
                        <Badge variant={sub.score >= 3 ? "default" : "secondary"}>
                          Score: {sub.score}/5
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-amber-500 border-amber-200 bg-amber-50 dark:bg-amber-950 dark:border-amber-900">
                          Pending Score
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No recent submissions found.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Link href="/admin/exams" className="flex items-center gap-4 rounded-lg border p-4 hover:bg-muted/50 transition-colors">
              <div className="bg-primary/10 p-2 rounded-md">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="text-sm font-semibold">Manage Exams</h4>
                <p className="text-xs text-muted-foreground">Create and update assessments</p>
              </div>
            </Link>
            
            <Link href="/admin/performance" className="flex items-center gap-4 rounded-lg border p-4 hover:bg-muted/50 transition-colors">
              <div className="bg-primary/10 p-2 rounded-md">
                <BarChart className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="text-sm font-semibold">Grade Submissions</h4>
                <p className="text-xs text-muted-foreground">Review and score Q&A answers</p>
              </div>
            </Link>
            
            <Link href="/admin/resources" className="flex items-center gap-4 rounded-lg border p-4 hover:bg-muted/50 transition-colors">
              <div className="bg-primary/10 p-2 rounded-md">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="text-sm font-semibold">Study Resources</h4>
                <p className="text-xs text-muted-foreground">Upload prep materials</p>
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
