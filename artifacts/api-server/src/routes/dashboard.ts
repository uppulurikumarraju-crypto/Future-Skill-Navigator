import { Router } from "express";
import { db } from "@workspace/db";
import { skillsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/dashboard/stats", async (req, res) => {
  try {
    const skills = await db.select().from(skillsTable);
    const risingSkillsCount = skills.filter((s) => s.trend === "rising").length;
    const decliningSkillsCount = skills.filter((s) => s.trend === "declining").length;
    const stableSkillsCount = skills.filter((s) => s.trend === "stable").length;

    const categoryCount: Record<string, number> = {};
    for (const s of skills) {
      categoryCount[s.category] = (categoryCount[s.category] ?? 0) + 1;
    }
    const topCategory = Object.entries(categoryCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "";

    const risingSkills = skills.filter((s) => s.trend === "rising");
    const avgFutureBoost =
      risingSkills.length > 0
        ? risingSkills.reduce((sum, s) => sum + (s.futureDemandScore - s.currentDemandScore), 0) /
          risingSkills.length
        : 0;

    res.json({
      totalSkills: skills.length,
      risingSkillsCount,
      decliningSkillsCount,
      stableSkillsCount,
      topCategory,
      avgFutureBoost: Math.round(avgFutureBoost * 10) / 10,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/dashboard/skill-trends", async (req, res) => {
  try {
    const skills = await db.select().from(skillsTable);
    const trends = skills.map((s) => ({
      skillId: s.id,
      skillName: s.name,
      category: s.category,
      trend: s.trend,
      currentDemandScore: s.currentDemandScore,
      futureDemandScore: s.futureDemandScore,
      growthPercent:
        s.currentDemandScore > 0
          ? Math.round(((s.futureDemandScore - s.currentDemandScore) / s.currentDemandScore) * 100)
          : 0,
    }));
    res.json(trends);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
