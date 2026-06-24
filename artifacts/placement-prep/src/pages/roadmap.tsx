import { useGetProfileRoadmap } from "@workspace/api-client-react";
import { useProfileStore } from "@/lib/profile-store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus, Clock, AlertCircle, ChevronRight } from "lucide-react";
import { Link } from "wouter";

const priorityConfig: Record<string, { label: string; color: string; bg: string }> = {
  critical: { label: "Critical", color: "text-rose-700", bg: "bg-rose-100" },
  high:     { label: "High",     color: "text-amber-700", bg: "bg-amber-100" },
  medium:   { label: "Medium",   color: "text-blue-700",  bg: "bg-blue-100" },
  low:      { label: "Low",      color: "text-slate-600", bg: "bg-slate-100" },
};

function TrendPill({ trend }: { trend: string }) {
  if (trend === "rising") return (
    <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
      <TrendingUp className="h-3 w-3" /> Rising
    </span>
  );
  if (trend === "declining") return (
    <span className="inline-flex items-center gap-1 text-xs text-rose-500 font-medium">
      <TrendingDown className="h-3 w-3" /> Declining
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 text-xs text-slate-500 font-medium">
      <Minus className="h-3 w-3" /> Stable
    </span>
  );
}

export default function Roadmap() {
  const { profileId } = useProfileStore();
  const { data: roadmap, isLoading } = useGetProfileRoadmap(profileId as number, {
    query: { enabled: !!profileId }
  });

  if (!profileId) return (
    <div className="text-center py-16">
      <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
      <p className="text-muted-foreground">Please complete onboarding first.</p>
      <Link href="/" className="text-primary text-sm mt-2 inline-block hover:underline">Go to onboarding</Link>
    </div>
  );

  if (isLoading) return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 bg-muted w-1/3 rounded" />
      <div className="h-24 bg-muted rounded-xl" />
      {[1,2,3,4].map(i => <div key={i} className="h-28 bg-muted rounded-xl" />)}
    </div>
  );

  const totalWeeks = roadmap?.steps?.reduce((acc, s) => acc + s.timeEstimateWeeks, 0) ?? 0;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-1">Your Roadmap</h1>
        <p className="text-muted-foreground">
          Personalized path to <span className="text-foreground font-semibold">{roadmap?.targetRole}</span>
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-5 text-center">
            <p className="text-3xl font-bold font-mono text-primary">{roadmap?.readinessScore ?? 0}</p>
            <p className="text-xs text-muted-foreground mt-1">Readiness score</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 text-center">
            <p className="text-3xl font-bold font-mono">{roadmap?.steps?.length ?? 0}</p>
            <p className="text-xs text-muted-foreground mt-1">Skills to learn</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 text-center">
            <p className="text-3xl font-bold font-mono">{totalWeeks}</p>
            <p className="text-xs text-muted-foreground mt-1">Total weeks</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">Learning Plan</h2>
        <div className="space-y-3">
          {roadmap?.steps?.map((step, i) => {
            const pConfig = priorityConfig[step.priority] ?? priorityConfig.low;
            return (
              <Card key={step.skillId} className="relative overflow-hidden">
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${step.priority === "critical" ? "bg-rose-400" : step.priority === "high" ? "bg-amber-400" : step.priority === "medium" ? "bg-blue-400" : "bg-slate-300"}`} />
                <CardContent className="pl-5 pt-4 pb-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-muted-foreground font-mono">#{i + 1}</span>
                        <Link href={`/skills/${step.skillId}`} className="font-semibold text-sm hover:text-primary transition-colors">
                          {step.skillName}
                        </Link>
                        <TrendPill trend={step.trend} />
                      </div>
                      <p className="text-xs text-muted-foreground">{step.reason}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-xs font-mono text-blue-500">Now: {Math.round(step.currentDemandScore)}</span>
                        <ChevronRight className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs font-mono text-emerald-500">Future: {Math.round(step.futureDemandScore)}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${pConfig.bg} ${pConfig.color}`}>
                        {pConfig.label}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {step.timeEstimateWeeks}w
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {!roadmap?.steps?.length && (
            <div className="text-center py-12 text-muted-foreground">
              <p>No roadmap steps generated. Add skills to your profile to get started.</p>
              <Link href="/profile" className="text-primary text-sm mt-2 inline-block hover:underline">Go to profile</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
