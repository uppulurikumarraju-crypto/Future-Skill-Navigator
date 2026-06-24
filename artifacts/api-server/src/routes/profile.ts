import { Router } from "express";
import { db } from "@workspace/db";
import {
  profilesTable,
  rolesTable,
  profileSkillsTable,
  skillsTable,
} from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  CreateProfileBody,
  GetProfileParams,
  UpdateProfileParams,
  UpdateProfileBody,
  GetProfileSkillsParams,
  AddProfileSkillParams,
  AddProfileSkillBody,
} from "@workspace/api-zod";

const router = Router();

router.post("/profile", async (req, res) => {
  try {
    const body = CreateProfileBody.parse(req.body);
    const [profile] = await db.insert(profilesTable).values(body).returning();
    const [role] = await db.select().from(rolesTable).where(eq(rolesTable.id, profile.targetRoleId));
    res.status(201).json({ ...profile, targetRoleTitle: role?.title ?? null });
  } catch (err) {
    req.log.error(err);
    res.status(400).json({ error: "Invalid input" });
  }
});

router.get("/profile/:id", async (req, res) => {
  try {
    const { id } = GetProfileParams.parse({ id: Number(req.params.id) });
    const [profile] = await db.select().from(profilesTable).where(eq(profilesTable.id, id));
    if (!profile) return res.status(404).json({ error: "Profile not found" });
    const [role] = await db.select().from(rolesTable).where(eq(rolesTable.id, profile.targetRoleId));
    res.json({ ...profile, targetRoleTitle: role?.title ?? null });
  } catch (err) {
    req.log.error(err);
    res.status(400).json({ error: "Invalid id" });
  }
});

router.patch("/profile/:id", async (req, res) => {
  try {
    const { id } = UpdateProfileParams.parse({ id: Number(req.params.id) });
    const body = UpdateProfileBody.parse(req.body);
    const [updated] = await db
      .update(profilesTable)
      .set(body)
      .where(eq(profilesTable.id, id))
      .returning();
    if (!updated) return res.status(404).json({ error: "Profile not found" });
    const [role] = await db.select().from(rolesTable).where(eq(rolesTable.id, updated.targetRoleId));
    res.json({ ...updated, targetRoleTitle: role?.title ?? null });
  } catch (err) {
    req.log.error(err);
    res.status(400).json({ error: "Invalid input" });
  }
});

router.get("/profile/:id/skills", async (req, res) => {
  try {
    const { id } = GetProfileSkillsParams.parse({ id: Number(req.params.id) });
    const rows = await db
      .select({
        id: profileSkillsTable.id,
        profileId: profileSkillsTable.profileId,
        skillId: profileSkillsTable.skillId,
        proficiencyLevel: profileSkillsTable.proficiencyLevel,
        skillName: skillsTable.name,
        skillCategory: skillsTable.category,
        currentDemandScore: skillsTable.currentDemandScore,
        futureDemandScore: skillsTable.futureDemandScore,
        trend: skillsTable.trend,
      })
      .from(profileSkillsTable)
      .innerJoin(skillsTable, eq(profileSkillsTable.skillId, skillsTable.id))
      .where(eq(profileSkillsTable.profileId, id));
    res.json(rows);
  } catch (err) {
    req.log.error(err);
    res.status(400).json({ error: "Invalid id" });
  }
});

router.post("/profile/:id/skills", async (req, res) => {
  try {
    const { id } = AddProfileSkillParams.parse({ id: Number(req.params.id) });
    const body = AddProfileSkillBody.parse(req.body);
    const [row] = await db
      .insert(profileSkillsTable)
      .values({ profileId: id, skillId: body.skillId, proficiencyLevel: body.proficiencyLevel })
      .returning();
    const [skill] = await db.select().from(skillsTable).where(eq(skillsTable.id, row.skillId));
    res.status(201).json({
      ...row,
      skillName: skill?.name ?? "",
      skillCategory: skill?.category ?? "",
      currentDemandScore: skill?.currentDemandScore ?? null,
      futureDemandScore: skill?.futureDemandScore ?? null,
      trend: skill?.trend ?? null,
    });
  } catch (err) {
    req.log.error(err);
    res.status(400).json({ error: "Invalid input" });
  }
});

export default router;
