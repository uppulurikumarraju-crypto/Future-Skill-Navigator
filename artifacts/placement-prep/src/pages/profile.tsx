import { useState } from "react";
import { useGetProfile, useGetProfileSkills, useAddProfileSkill, useListSkills, useListRoles } from "@workspace/api-client-react";
import { getGetProfileSkillsQueryKey } from "@workspace/api-client-react";
import { useProfileStore } from "@/lib/profile-store";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, TrendingUp, TrendingDown, Minus, Plus, GraduationCap, Building2 } from "lucide-react";
import { Link } from "wouter";

const proficiencyColors: Record<string, string> = {
  beginner: "bg-slate-100 text-slate-700",
  intermediate: "bg-blue-100 text-blue-700",
  advanced: "bg-emerald-100 text-emerald-700",
};

function TrendIcon({ trend }: { trend: string | null | undefined }) {
  if (trend === "rising") return <TrendingUp className="h-3 w-3 text-emerald-500" />;
  if (trend === "declining") return <TrendingDown className="h-3 w-3 text-rose-500" />;
  return <Minus className="h-3 w-3 text-slate-400" />;
}

export default function Profile() {
  const { profileId } = useProfileStore();
  const queryClient = useQueryClient();
  const [selectedSkillId, setSelectedSkillId] = useState<string>("");
  const [selectedProficiency, setSelectedProficiency] = useState<string>("beginner");
  const [adding, setAdding] = useState(false);

  const { data: profile, isLoading: profileLoading } = useGetProfile(profileId as number, {
    query: { enabled: !!profileId }
  });
  const { data: profileSkills, isLoading: skillsLoading } = useGetProfileSkills(profileId as number, {
    query: { enabled: !!profileId }
  });
  const { data: allSkills } = useListSkills({});
  const { data: roles } = useListRoles();

  const addSkill = useAddProfileSkill();

  const existingSkillIds = new Set(profileSkills?.map(s => s.skillId));
  const availableSkills = allSkills?.filter(s => !existingSkillIds.has(s.id)) ?? [];

  const targetRole = roles?.find(r => r.id === profile?.targetRoleId);

  const handleAddSkill = () => {
    if (!selectedSkillId || !profileId) return;
    setAdding(true);
    addSkill.mutate(
      { id: profileId, data: { skillId: Number(selectedSkillId), proficiencyLevel: selectedProficiency as "beginner" | "intermediate" | "advanced" } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetProfileSkillsQueryKey(profileId) });
          setSelectedSkillId("");
          setAdding(false);
        },
        onError: () => setAdding(false),
      }
    );
  };

  if (!profileId) return (
    <div className="text-center py-16">
      <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
      <p className="text-muted-foreground">Please complete onboarding first.</p>
      <Link href="/" className="text-primary text-sm mt-2 inline-block hover:underline">Go to onboarding</Link>
    </div>
  );

  if (profileLoading) return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 bg-muted w-1/4 rounded" />
      <div className="h-32 bg-muted rounded-xl" />
    </div>
  );

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-1">Profile</h1>
        <p className="text-muted-foreground">Manage your skills and track your progress.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{profile?.name}</CardTitle>
          <CardDescription>{profile?.email}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Building2 className="h-4 w-4" />
              <span>{profile?.college}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <GraduationCap className="h-4 w-4" />
              <span>Class of {profile?.graduationYear}</span>
            </div>
          </div>
          {targetRole && (
            <div className="pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground mb-1">Target role</p>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-md text-sm font-semibold">
                {targetRole.title}
                <Badge variant="secondary" className="text-xs">{targetRole.domain}</Badge>
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add a Skill</CardTitle>
          <CardDescription>Track skills you already know or are currently learning.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 flex-wrap items-end">
            <div className="flex-1 min-w-[160px]">
              <label className="text-xs text-muted-foreground mb-1 block">Skill</label>
              <Select value={selectedSkillId} onValueChange={setSelectedSkillId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a skill..." />
                </SelectTrigger>
                <SelectContent>
                  {availableSkills.map(s => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="min-w-[140px]">
              <label className="text-xs text-muted-foreground mb-1 block">Proficiency</label>
              <Select value={selectedProficiency} onValueChange={setSelectedProficiency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <button
              onClick={handleAddSkill}
              disabled={!selectedSkillId || adding}
              className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add
            </button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">My Skills</CardTitle>
          <CardDescription>{profileSkills?.length ?? 0} skills tracked</CardDescription>
        </CardHeader>
        <CardContent>
          {skillsLoading ? (
            <div className="space-y-2">
              {[1,2,3].map(i => <div key={i} className="h-14 bg-muted rounded-lg animate-pulse" />)}
            </div>
          ) : profileSkills?.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No skills added yet. Start by adding skills you know above.</p>
          ) : (
            <div className="space-y-2">
              {profileSkills?.map((ps) => (
                <div key={ps.id} className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/40 transition-colors">
                  <div className="flex items-center gap-3">
                    <div>
                      <Link href={`/skills/${ps.skillId}`} className="font-medium text-sm hover:text-primary transition-colors">
                        {ps.skillName}
                      </Link>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground">{ps.skillCategory}</span>
                        <TrendIcon trend={ps.trend} />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {ps.futureDemandScore != null && (
                      <div className="text-right">
                        <p className="text-xs text-emerald-600 font-mono font-semibold">{Math.round(ps.futureDemandScore)} future</p>
                        <p className="text-xs text-muted-foreground font-mono">{Math.round(ps.currentDemandScore ?? 0)} now</p>
                      </div>
                    )}
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${proficiencyColors[ps.proficiencyLevel]}`}>
                      {ps.proficiencyLevel.charAt(0).toUpperCase() + ps.proficiencyLevel.slice(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
