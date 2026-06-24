import { Router } from "express";
import { db } from "@workspace/db";
import { assessmentsTable, skillsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { SubmitAssessmentBody, GetAssessmentsParams } from "@workspace/api-zod";

const router = Router();

router.post("/assessment", async (req, res) => {
  try {
    const body = SubmitAssessmentBody.parse(req.body);
    const [row] = await db.insert(assessmentsTable).values(body).returning();
    const [skill] = await db.select().from(skillsTable).where(eq(skillsTable.id, row.skillId));
    res.status(201).json({ ...row, skillName: skill?.name ?? "" });
  } catch (err) {
    req.log.error(err);
    res.status(400).json({ error: "Invalid input" });
  }
});

router.get("/assessment/:profileId", async (req, res) => {
  try {
    const { profileId } = GetAssessmentsParams.parse({ profileId: Number(req.params.profileId) });
    const rows = await db
      .select({
        id: assessmentsTable.id,
        profileId: assessmentsTable.profileId,
        skillId: assessmentsTable.skillId,
        selfRating: assessmentsTable.selfRating,
        notes: assessmentsTable.notes,
        createdAt: assessmentsTable.createdAt,
        skillName: skillsTable.name,
      })
      .from(assessmentsTable)
      .innerJoin(skillsTable, eq(assessmentsTable.skillId, skillsTable.id))
      .where(eq(assessmentsTable.profileId, profileId));
    res.json(rows);
  } catch (err) {
    req.log.error(err);
    res.status(400).json({ error: "Invalid id" });
  }
});

export default router;
