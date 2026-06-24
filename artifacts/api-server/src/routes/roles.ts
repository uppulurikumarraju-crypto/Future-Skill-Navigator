import { Router } from "express";
import { db } from "@workspace/db";
import { rolesTable, roleSkillsTable, skillsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { GetRoleSkillsParams } from "@workspace/api-zod";

const router = Router();

router.get("/roles", async (req, res) => {
  try {
    const roles = await db.select().from(rolesTable);
    res.json(roles);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/roles/:id/skills", async (req, res) => {
  try {
    const { id } = GetRoleSkillsParams.parse({ id: Number(req.params.id) });
    const rows = await db
      .select({
        id: roleSkillsTable.id,
        roleId: roleSkillsTable.roleId,
        skillId: roleSkillsTable.skillId,
        importance: roleSkillsTable.importance,
        skillName: skillsTable.name,
        skillCategory: skillsTable.category,
      })
      .from(roleSkillsTable)
      .innerJoin(skillsTable, eq(roleSkillsTable.skillId, skillsTable.id))
      .where(eq(roleSkillsTable.roleId, id));
    res.json(rows);
  } catch (err) {
    req.log.error(err);
    res.status(400).json({ error: "Invalid id" });
  }
});

export default router;
