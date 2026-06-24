import { Router } from "express";
import { db } from "@workspace/db";
import {
  profilesTable,
  rolesTable,
  profileSkillsTable,
  roleSkillsTable,
  skillsTable,
} from "@workspace/db";
import { eq } from "drizzle-orm";
import { GetProfileRoadmapParams } from "@workspace/api-zod";

const router = Router();

router.get("/profile/:id/roadmap", async (req, res) => {
  try {
    const { id } = GetProfileRoadmapParams.parse({ id: Number(req.params.id) });

    const [profile] = await db.select().from(profilesTable).where(eq(profilesTable.id, id));
    if (!profile) return res.status(404).json({ error: "Profile not found" });

    const [role] = await db.select().from(rolesTable).where(eq(rolesTable.id, profile.targetRoleId));

    const profileSkills = await db
      .select({ skillId: profileSkillsTable.skillId })
      .from(profileSkillsTable)
      .where(eq(profileSkillsTable.profileId, id));

    const profileSkillIds = new Set(profileSkills.map((ps) => ps.skillId));

    const roleSkillRows = await db
      .select({
        skillId: roleSkillsTable.skillId,
        importance: roleSkillsTable.importance,
        skillName: skillsTable.name,
        currentDemandScore: skillsTable.currentDemandScore,
        futureDemandScore: skillsTable.futureDemandScore,
        trend: skillsTable.trend,
      })
      .from(roleSkillsTable)
      .innerJoin(skillsTable, eq(roleSkillsTable.skillId, skillsTable.id))
      .where(eq(roleSkillsTable.roleId, profile.targetRoleId));

    const totalRoleSkills = roleSkillRows.length;
    const ownedMustHave = roleSkillRows.filter(
      (rs) => rs.importance === "must_have" && profileSkillIds.has(rs.skillId)
    ).length;
    const totalMustHave = roleSkillRows.filter((rs) => rs.importance === "must_have").length;

    const readinessScore = totalMustHave > 0
      ? Math.round(
          ((ownedMustHave / totalMustHave) * 0.7 +
            (profileSkillIds.size / Math.max(totalRoleSkills, 1)) * 0.3) *
            100
        )
      : 50;

    const importancePriority: Record<string, string> = {
      must_have: "critical",
      good_to_have: "high",
      bonus: "medium",
    };

    const timeEstimate: Record<string, number> = {
      must_have: 6,
      good_to_have: 4,
      bonus: 2,
    };

    const gapSkills = roleSkillRows
      .filter((rs) => !profileSkillIds.has(rs.skillId))
      .map((rs) => ({
        skillId: rs.skillId,
        skillName: rs.skillName,
        priority: importancePriority[rs.importance] ?? "low",
        timeEstimateWeeks: timeEstimate[rs.importance] ?? 2,
        reason: `Required for ${role?.title ?? "your target role"} — currently a gap in your profile`,
        currentDemandScore: rs.currentDemandScore,
        futureDemandScore: rs.futureDemandScore,
        trend: rs.trend,
      }));

    const allSkills = await db.select().from(skillsTable);
    const futureHighDemand = allSkills
      .filter(
        (s) =>
          !profileSkillIds.has(s.id) &&
          s.futureDemandScore > 75 &&
          s.trend === "rising"
      )
      .slice(0, 3)
      .map((s) => ({
        skillId: s.id,
        skillName: s.name,
        priority: "medium" as const,
        timeEstimateWeeks: 3,
        reason: "High future demand — start early to stand out at graduation",
        currentDemandScore: s.currentDemandScore,
        futureDemandScore: s.futureDemandScore,
        trend: s.trend,
      }));

    const steps = [...gapSkills, ...futureHighDemand].sort((a, b) => {
      const order: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
      return (order[a.priority] ?? 3) - (order[b.priority] ?? 3);
    });

    res.json({
      profileId: id,
      targetRole: role?.title ?? "Unknown Role",
      readinessScore,
      gapSkills,
      steps,
    });
  } catch (err) {
    req.log.error(err);
    res.status(400).json({ error: "Invalid id" });
  }
});

export default router;
