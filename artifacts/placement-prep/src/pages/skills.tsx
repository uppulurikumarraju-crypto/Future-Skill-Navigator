import { useState } from "react";
import { useListSkills, useGetSkillCategories } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, TrendingUp, TrendingDown, Minus, ChevronRight } from "lucide-react";

function TrendBadge({ trend }: { trend: string }) {
  if (trend === "rising") return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
      <TrendingUp className="h-3 w-3" /> Rising
    </span>
  );
  if (trend === "declining") return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-700">
      <TrendingDown className="h-3 w-3" /> Declining
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
      <Minus className="h-3 w-3" /> Stable
    </span>
  );
}

function DemandBar({ label, score, color }: { label: string; score: number; color: string }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{label}</span>
        <span className="font-mono font-bold">{Math.round(score)}</span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

export default function Skills() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  const { data: skills, isLoading } = useListSkills({ search: search || undefined, category: category || undefined });
  const { data: categories } = useGetSkillCategories();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-1">Skills Explorer</h1>
        <p className="text-muted-foreground">Compare current demand vs future projections across all skills.</p>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search skills..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setCategory("")}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors border ${category === "" ? "bg-primary text-primary-foreground border-primary" : "bg-background text-foreground border-border hover:bg-muted"}`}
          >
            All
          </button>
          {categories?.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat === category ? "" : cat)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors border ${category === cat ? "bg-primary text-primary-foreground border-primary" : "bg-background text-foreground border-border hover:bg-muted"}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-48 bg-muted rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {skills?.map((skill) => (
            <Link key={skill.id} href={`/skills/${skill.id}`}>
              <Card className="cursor-pointer hover:shadow-md transition-all hover:-translate-y-0.5 border-border h-full">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{skill.name}</CardTitle>
                      <Badge variant="secondary" className="mt-1 text-xs">{skill.category}</Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendBadge trend={skill.trend} />
                      <ChevronRight className="h-4 w-4 text-muted-foreground ml-1" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-xs text-muted-foreground line-clamp-2">{skill.description}</p>
                  <div className="space-y-2">
                    <DemandBar label="Current demand" score={skill.currentDemandScore} color="bg-blue-400" />
                    <DemandBar label="Future demand (2yr)" score={skill.futureDemandScore} color="bg-emerald-400" />
                  </div>
                  {skill.avgSalary && (
                    <p className="text-xs text-muted-foreground font-mono">
                      Avg salary: ₹{(skill.avgSalary / 100000).toFixed(1)}L
                    </p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
          {skills?.length === 0 && (
            <div className="col-span-3 text-center py-16 text-muted-foreground">
              No skills found matching your search.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
