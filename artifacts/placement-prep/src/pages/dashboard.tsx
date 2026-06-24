import { useGetDashboardStats, useGetProfileRoadmap } from "@workspace/api-client-react";
import { useProfileStore } from "@/lib/profile-store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, TrendingUp, BookOpen, Target } from "lucide-react";

export default function Dashboard() {
  const { profileId } = useProfileStore();
  
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: roadmap, isLoading: roadmapLoading } = useGetProfileRoadmap(profileId as number, {
    query: { enabled: !!profileId }
  });

  if (statsLoading || roadmapLoading) {
    return <div className="animate-pulse space-y-8">
      <div className="h-8 bg-muted w-1/4 rounded"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="h-32 bg-muted rounded-xl"></div>)}
      </div>
    </div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Overview</h1>
        <p className="text-muted-foreground">Your real-time placement readiness pulse.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Readiness Score</CardTitle>
            <Target className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{roadmap?.readinessScore || 0}<span className="text-muted-foreground text-sm font-normal">/100</span></div>
            <p className="text-xs text-muted-foreground mt-1">Based on target role</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rising Skills</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.risingSkillsCount || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">In high future demand</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Future Boost</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">+{Math.round(stats?.avgFutureBoost || 0)}%</div>
            <p className="text-xs text-muted-foreground mt-1">Expected demand growth</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gap Skills</CardTitle>
            <BookOpen className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{roadmap?.gapSkills?.length || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">To master for target role</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Priority Action Plan</CardTitle>
            <CardDescription>Your next steps based on current market demand</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {roadmap?.steps?.slice(0, 5).map((step, i) => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div>
                    <p className="font-semibold text-sm">{step.skillName}</p>
                    <p className="text-xs text-muted-foreground mt-1">{step.reason}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                      {step.timeEstimateWeeks} weeks
                    </span>
                  </div>
                </div>
              ))}
              {!roadmap?.steps?.length && (
                <div className="text-center py-8 text-muted-foreground">
                  No action steps generated yet.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
