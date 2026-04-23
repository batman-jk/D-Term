import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { Layout } from "@/components/layout";

// Pages
import NotFound from "@/pages/not-found";
import Landing from "@/pages/index";
import RoleSelection from "@/pages/role-selection";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminExams from "@/pages/admin/exams";
import AdminExamDetail from "@/pages/admin/exam-detail";
import AdminPerformance from "@/pages/admin/performance";
import AdminResources from "@/pages/admin/resources";
import StudentHome from "@/pages/student/home";
import StudentLogin from "@/pages/student/login";
import StudentJoin from "@/pages/student/join";
import StudentExam from "@/pages/student/exam";
import StudentResults from "@/pages/student/results";
import Profile from "@/pages/profile";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5,
    },
  },
});

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/role-selection" component={RoleSelection} />
        
        {/* Admin Routes */}
        <Route path="/admin" component={AdminDashboard} />
        <Route path="/admin/exams" component={AdminExams} />
        <Route path="/admin/exams/:id" component={AdminExamDetail} />
        <Route path="/admin/performance" component={AdminPerformance} />
        <Route path="/admin/resources" component={AdminResources} />

        {/* Student Routes */}
        <Route path="/student" component={StudentHome} />
        <Route path="/student/login" component={StudentLogin} />
        <Route path="/student/join" component={StudentJoin} />
        <Route path="/student/exam" component={StudentExam} />
        <Route path="/student/results" component={StudentResults} />

        {/* Shared */}
        <Route path="/profile" component={Profile} />
        
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="dtect-theme">
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
