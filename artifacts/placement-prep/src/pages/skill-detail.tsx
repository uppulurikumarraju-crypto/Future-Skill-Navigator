import { useParams, Link } from "wouter";
import { useGetSkill } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, TrendingUp, TrendingDown, Minus, Briefcase, IndianRupee } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

function TrendIcon({ trend }: { trend: string }) {
  if (trend === "rising") return <TrendingUp className="h-5 w-5 text-emerald-500" />;
  if (trend === "declining") return <TrendingDown className="h-5 w-5 text-rose-500" />;
  return <Minus className="h-5 w-5 text-slate-400" />;
}

export default function SkillDetail() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const { data: skill, isLoading } = useGetSkill(id, { query: { enabled: !!id } });

  if (isLoading) return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 bg-muted w-1/3 rounded" />
      <div className="h-64 bg-muted rounded-xl" />
    </div>
  );

  if (!skill) return (
    <div className="text-center py-16 text-muted-foreground">Skill not found.</div>
  );

  const chartData = [
    { name: "Current", demand: Math.round(skill.currentDemandScore), fill: "#60a5fa" },
    { name: "2-Year Forecast", demand: Math.round(skill.futureDemandScore), fill: "#34d399" },
  ];

  const growth = skill.currentDemandScore > 0
    ? Math.round(((skill.futureDemandScore - skill.currentDemandScore) / skill.currentDemandScore) * 100)
    : 0;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <Link href="/skills" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to Skills
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{skill.name}</h1>
            <Badge variant="secondary" className="mt-2">{skill.category}</Badge>
          </div>
          <div className="flex items-center gap-2 text-sm font-medium">
            <TrendIcon trend={skill.trend} />
            <span className={skill.trend === "rising" ? "text-emerald-600" : skill.trend === "declining" ? "text-rose-600" : "text-slate-500"}>
              {skill.trend.charAt(0).toUpperCase() + skill.trend.slice(1)}
            </span>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Demand Forecast</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barSize={48}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v) => [`${v}/100`, "Demand score"]} />
                <Bar dataKey="demand" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <rect key={index} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-border">
            <div className="text-center">
              <p className="text-2xl font-bold font-mono text-blue-500">{Math.round(skill.currentDemandScore)}</p>
              <p className="text-xs text-muted-foreground mt-1">Current score</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold font-mono text-emerald-500">{Math.round(skill.futureDemandScore)}</p>
              <p className="text-xs text-muted-foreground mt-1">Future score</p>
            </div>
            <div className="text-center">
              <p className={`text-2xl font-bold font-mono ${growth >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                {growth >= 0 ? "+" : ""}{growth}%
              </p>
              <p className="text-xs text-muted-foreground mt-1">Growth</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">About this skill</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground leading-relaxed">{skill.description}</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        {skill.avgSalary && (
          <Card>
            <CardContent className="pt-5">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <IndianRupee className="h-4 w-4" />
                <span className="text-xs font-medium uppercase tracking-wide">Avg Salary</span>
              </div>
              <p className="text-2xl font-bold font-mono">₹{(skill.avgSalary / 100000).toFixed(1)}L</p>
            </CardContent>
          </Card>
        )}
        {skill.jobCount && (
          <Card>
            <CardContent className="pt-5">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Briefcase className="h-4 w-4" />
                <span className="text-xs font-medium uppercase tracking-wide">Open Positions</span>
              </div>
              <p className="text-2xl font-bold font-mono">{skill.jobCount.toLocaleString()}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
