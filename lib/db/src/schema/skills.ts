import { pgTable, serial, text, integer, real, pgEnum, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const trendEnum = pgEnum("trend", ["rising", "stable", "declining"]);
export const importanceEnum = pgEnum("importance", ["must_have", "good_to_have", "bonus"]);
export const proficiencyEnum = pgEnum("proficiency", ["beginner", "intermediate", "advanced"]);

export const skillsTable = pgTable("skills", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  currentDemandScore: real("current_demand_score").notNull(),
  futureDemandScore: real("future_demand_score").notNull(),
  trend: trendEnum("trend").notNull(),
  description: text("description").notNull(),
  resources: text("resources"),
  avgSalary: integer("avg_salary"),
  jobCount: integer("job_count"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const rolesTable = pgTable("roles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  domain: text("domain").notNull(),
  avgSalary: integer("avg_salary").notNull(),
  description: text("description").notNull(),
  openings: integer("openings"),
});

export const roleSkillsTable = pgTable("role_skills", {
  id: serial("id").primaryKey(),
  roleId: integer("role_id").notNull().references(() => rolesTable.id),
  skillId: integer("skill_id").notNull().references(() => skillsTable.id),
  importance: importanceEnum("importance").notNull(),
});

export const profilesTable = pgTable("profiles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  targetRoleId: integer("target_role_id").notNull().references(() => rolesTable.id),
  graduationYear: integer("graduation_year").notNull(),
  college: text("college").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const profileSkillsTable = pgTable("profile_skills", {
  id: serial("id").primaryKey(),
  profileId: integer("profile_id").notNull().references(() => profilesTable.id),
  skillId: integer("skill_id").notNull().references(() => skillsTable.id),
  proficiencyLevel: proficiencyEnum("proficiency_level").notNull(),
});

export const assessmentsTable = pgTable("assessments", {
  id: serial("id").primaryKey(),
  profileId: integer("profile_id").notNull().references(() => profilesTable.id),
  skillId: integer("skill_id").notNull().references(() => skillsTable.id),
  selfRating: integer("self_rating").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSkillSchema = createInsertSchema(skillsTable).omit({ id: true, createdAt: true });
export const insertRoleSchema = createInsertSchema(rolesTable).omit({ id: true });
export const insertProfileSchema = createInsertSchema(profilesTable).omit({ id: true, createdAt: true });
export const insertProfileSkillSchema = createInsertSchema(profileSkillsTable).omit({ id: true });
export const insertAssessmentSchema = createInsertSchema(assessmentsTable).omit({ id: true, createdAt: true });

export type Skill = typeof skillsTable.$inferSelect;
export type InsertSkill = z.infer<typeof insertSkillSchema>;
export type Role = typeof rolesTable.$inferSelect;
export type Profile = typeof profilesTable.$inferSelect;
export type ProfileSkill = typeof profileSkillsTable.$inferSelect;
export type Assessment = typeof assessmentsTable.$inferSelect;
