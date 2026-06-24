import { Router } from "express";
import { db } from "@workspace/db";
import { skillsTable } from "@workspace/db";
import { eq, ilike, and, type SQL } from "drizzle-orm";
import {
  ListSkillsQueryParams,
  CreateSkillBody,
  GetSkillParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/skills", async (req, res) => {
  try {
    const query = ListSkillsQueryParams.parse(req.query);
    const conditions: SQL[] = [];
    if (query.category) conditions.push(eq(skillsTable.category, query.category));
    if (query.search) conditions.push(ilike(skillsTable.name, `%${query.search}%`));
    const skills = conditions.length > 0
      ? await db.select().from(skillsTable).where(and(...conditions))
      : await db.select().from(skillsTable);
    res.json(skills);
  } catch (err) {
    req.log.error(err);
    res.status(400).json({ error: "Invalid query" });
  }
});

router.post("/skills", async (req, res) => {
  try {
    const body = CreateSkillBody.parse(req.body);
    const [skill] = await db.insert(skillsTable).values(body).returning();
    res.status(201).json(skill);
  } catch (err) {
    req.log.error(err);
    res.status(400).json({ error: "Invalid input" });
  }
});

router.get("/skills/trending", async (req, res) => {
  try {
    const skills = await db
      .select()
      .from(skillsTable)
      .where(eq(skillsTable.trend, "rising"))
      .orderBy(skillsTable.currentDemandScore);
    res.json(skills.slice(-8).reverse());
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/skills/future", async (req, res) => {
  try {
    const skills = await db.select().from(skillsTable);
    const sorted = skills
      .filter((s) => s.futureDemandScore > s.currentDemandScore)
      .sort((a, b) => (b.futureDemandScore - b.currentDemandScore) - (a.futureDemandScore - a.currentDemandScore))
      .slice(0, 8);
    res.json(sorted);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/skills/categories", async (req, res) => {
  try {
    const skills = await db.select({ category: skillsTable.category }).from(skillsTable);
    const categories = [...new Set(skills.map((s) => s.category))].sort();
    res.json(categories);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/skills/:id", async (req, res) => {
  try {
    const { id } = GetSkillParams.parse({ id: Number(req.params.id) });
    const [skill] = await db.select().from(skillsTable).where(eq(skillsTable.id, id));
    if (!skill) return res.status(404).json({ error: "Skill not found" });
    res.json(skill);
  } catch (err) {
    req.log.error(err);
    res.status(400).json({ error: "Invalid id" });
  }
});

export default router;
