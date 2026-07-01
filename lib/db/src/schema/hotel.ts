import { pgTable, serial, text, integer, decimal, date, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const hotelRoomTypeEnum = pgEnum("hotel_room_type", ["single", "double", "luxury", "suite"]);
export const hotelRoomStatusEnum = pgEnum("hotel_room_status", ["available", "booked", "maintenance"]);
export const hotelBookingStatusEnum = pgEnum("hotel_booking_status", ["confirmed", "cancelled", "completed"]);
export const hotelUserRoleEnum = pgEnum("hotel_user_role", ["guest", "admin"]);

export const hotelUsersTable = pgTable("hotel_users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull(),
  passwordHash: text("password_hash").notNull(),
  role: hotelUserRoleEnum("role").notNull().default("guest"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const hotelRoomsTable = pgTable("hotel_rooms", {
  id: serial("id").primaryKey(),
  roomNumber: text("room_number").notNull().unique(),
  roomType: hotelRoomTypeEnum("room_type").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  status: hotelRoomStatusEnum("status").notNull().default("available"),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
  capacity: integer("capacity").notNull().default(2),
  amenities: text("amenities"),
});

export const hotelBookingsTable = pgTable("hotel_bookings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => hotelUsersTable.id),
  roomId: integer("room_id").notNull().references(() => hotelRoomsTable.id),
  checkIn: date("check_in", { mode: "string" }).notNull(),
  checkOut: date("check_out", { mode: "string" }).notNull(),
  status: hotelBookingStatusEnum("status").notNull().default("confirmed"),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertHotelUserSchema = createInsertSchema(hotelUsersTable).omit({ id: true, createdAt: true });
export const insertHotelRoomSchema = createInsertSchema(hotelRoomsTable).omit({ id: true });
export const insertHotelBookingSchema = createInsertSchema(hotelBookingsTable).omit({ id: true, createdAt: true });

export type HotelUser = typeof hotelUsersTable.$inferSelect;
export type HotelRoom = typeof hotelRoomsTable.$inferSelect;
export type HotelBooking = typeof hotelBookingsTable.$inferSelect;
export type InsertHotelUser = z.infer<typeof insertHotelUserSchema>;
export type InsertHotelRoom = z.infer<typeof insertHotelRoomSchema>;
export type InsertHotelBooking = z.infer<typeof insertHotelBookingSchema>;
