import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Home } from "lucide-react";
import { Link } from "wouter";

export default function StudentResults() {
  return (
    <div className="container max-w-lg py-16">
      <Card className="text-center border-primary/20">
        <CardHeader className="pb-4">
          <div className="mx-auto w-16 h-16 bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-500 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8" />
          </div>
          <CardTitle className="text-3xl font-bold">Submission Received</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground text-lg">
            Your assessment has been successfully submitted and recorded.
          </p>
          
          <div className="bg-muted p-4 rounded-lg inline-block text-left w-full max-w-sm">
            <h4 className="font-semibold mb-2">What happens next?</h4>
            <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-4">
              <li>MCQ questions are automatically graded.</li>
              <li>Open Q&A responses will be reviewed by faculty manually.</li>
              <li>Final scores will be posted in your student dashboard once grading is complete.</li>
            </ul>
          </div>

          <div className="pt-4">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/student">
                <Home className="w-4 h-4 mr-2" />
                Return to Dashboard
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
