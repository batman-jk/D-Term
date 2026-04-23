import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Shield, GraduationCap, Building2, Hash } from "lucide-react";

export default function Profile() {
  const { role, studentProfile } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!role) {
      setLocation("/");
    }
  }, [role, setLocation]);

  if (!role) return null;

  return (
    <div className="container max-w-2xl py-10">
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground">Manage your session details.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Session Information
            </CardTitle>
            <CardDescription>
              Your current active session details on D-Term.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4">
              <div className="flex flex-col gap-1 p-4 rounded-lg bg-muted/50 border">
                <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Role
                </span>
                <span className="text-lg font-semibold capitalize">{role}</span>
              </div>

              {role === "student" && studentProfile && (
                <>
                  <div className="flex flex-col gap-1 p-4 rounded-lg bg-muted/50 border">
                    <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <GraduationCap className="w-4 h-4" />
                      Full Name
                    </span>
                    <span className="text-lg font-semibold">{studentProfile.name}</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1 p-4 rounded-lg bg-muted/50 border">
                      <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Hash className="w-4 h-4" />
                        Roll Number
                      </span>
                      <span className="text-lg font-semibold">{studentProfile.rollNumber}</span>
                    </div>

                    <div className="flex flex-col gap-1 p-4 rounded-lg bg-muted/50 border">
                      <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        Department
                      </span>
                      <span className="text-lg font-semibold">{studentProfile.department}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
