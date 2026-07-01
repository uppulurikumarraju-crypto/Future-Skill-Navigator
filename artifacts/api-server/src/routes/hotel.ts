import { Router } from "express";
import { db } from "@workspace/db";
import {
  hotelUsersTable,
  hotelRoomsTable,
  hotelBookingsTable,
} from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import {
  HotelRegisterBody,
  HotelLoginBody,
  CreateHotelBookingBody,
  GetHotelRoomParams,
  GetUserHotelBookingsParams,
  CancelHotelBookingParams,
} from "@workspace/api-zod";
import { createHash } from "crypto";

const router = Router();

function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

function simpleToken(userId: number): string {
  return Buffer.from(`${userId}:${Date.now()}`).toString("base64");
}

router.post("/hotel/auth/register", async (req, res) => {
  try {
    const body = HotelRegisterBody.parse(req.body);
    const existing = await db.select().from(hotelUsersTable).where(eq(hotelUsersTable.email, body.email));
    if (existing.length > 0) {
      return res.status(400).json({ error: "Email already registered" });
    }
    const [user] = await db.insert(hotelUsersTable).values({
      name: body.name,
      email: body.email,
      phone: body.phone,
      passwordHash: hashPassword(body.password),
      role: "guest",
    }).returning();
    const token = simpleToken(user.id);
    res.status(201).json({
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role, createdAt: user.createdAt },
      token,
    });
  } catch (err) {
    req.log.error(err);
    res.status(400).json({ error: "Registration failed" });
  }
});

router.post("/hotel/auth/login", async (req, res) => {
  try {
    const body = HotelLoginBody.parse(req.body);
    const [user] = await db.select().from(hotelUsersTable).where(
      and(eq(hotelUsersTable.email, body.email), eq(hotelUsersTable.passwordHash, hashPassword(body.password)))
    );
    if (!user) return res.status(401).json({ error: "Invalid email or password" });
    const token = simpleToken(user.id);
    res.json({
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role, createdAt: user.createdAt },
      token,
    });
  } catch (err) {
    req.log.error(err);
    res.status(400).json({ error: "Login failed" });
  }
});

router.get("/hotel/rooms", async (req, res) => {
  try {
    const type = req.query.type as string | undefined;
    const status = req.query.status as string | undefined;
    const conditions = [];
    if (type) conditions.push(eq(hotelRoomsTable.roomType, type as any));
    if (status) conditions.push(eq(hotelRoomsTable.status, status as any));
    const rooms = conditions.length > 0
      ? await db.select().from(hotelRoomsTable).where(and(...conditions))
      : await db.select().from(hotelRoomsTable);
    res.json(rooms);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch rooms" });
  }
});

router.get("/hotel/rooms/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [room] = await db.select().from(hotelRoomsTable).where(eq(hotelRoomsTable.id, id));
    if (!room) return res.status(404).json({ error: "Room not found" });
    res.json(room);
  } catch (err) {
    req.log.error(err);
    res.status(400).json({ error: "Invalid id" });
  }
});

router.post("/hotel/bookings", async (req, res) => {
  try {
    const body = CreateHotelBookingBody.parse(req.body);
    const [room] = await db.select().from(hotelRoomsTable).where(eq(hotelRoomsTable.id, body.roomId));
    if (!room) return res.status(404).json({ error: "Room not found" });
    if (room.status !== "available") return res.status(400).json({ error: "Room is not available" });

    const checkIn = new Date(body.checkIn);
    const checkOut = new Date(body.checkOut);
    const nights = Math.max(1, Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)));
    const totalPrice = (parseFloat(room.price) * nights).toFixed(2);

    const [booking] = await db.insert(hotelBookingsTable).values({
      userId: body.userId,
      roomId: body.roomId,
      checkIn: body.checkIn,
      checkOut: body.checkOut,
      status: "confirmed",
      totalPrice,
    }).returning();

    await db.update(hotelRoomsTable).set({ status: "booked" }).where(eq(hotelRoomsTable.id, body.roomId));

    const [user] = await db.select().from(hotelUsersTable).where(eq(hotelUsersTable.id, body.userId));
    res.status(201).json({
      ...booking,
      totalPrice: parseFloat(booking.totalPrice),
      guestName: user?.name ?? "",
      roomNumber: room.roomNumber,
      roomType: room.roomType,
    });
  } catch (err) {
    req.log.error(err);
    res.status(400).json({ error: "Booking failed" });
  }
});

router.get("/hotel/bookings/user/:userId", async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const rows = await db
      .select({
        id: hotelBookingsTable.id,
        userId: hotelBookingsTable.userId,
        roomId: hotelBookingsTable.roomId,
        checkIn: hotelBookingsTable.checkIn,
        checkOut: hotelBookingsTable.checkOut,
        status: hotelBookingsTable.status,
        totalPrice: hotelBookingsTable.totalPrice,
        createdAt: hotelBookingsTable.createdAt,
        guestName: hotelUsersTable.name,
        roomNumber: hotelRoomsTable.roomNumber,
        roomType: hotelRoomsTable.roomType,
      })
      .from(hotelBookingsTable)
      .innerJoin(hotelUsersTable, eq(hotelBookingsTable.userId, hotelUsersTable.id))
      .innerJoin(hotelRoomsTable, eq(hotelBookingsTable.roomId, hotelRoomsTable.id))
      .where(eq(hotelBookingsTable.userId, userId));
    res.json(rows.map(r => ({ ...r, totalPrice: parseFloat(r.totalPrice) })));
  } catch (err) {
    req.log.error(err);
    res.status(400).json({ error: "Failed to fetch bookings" });
  }
});

router.patch("/hotel/bookings/:id/cancel", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [booking] = await db.select().from(hotelBookingsTable).where(eq(hotelBookingsTable.id, id));
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    const [updated] = await db.update(hotelBookingsTable).set({ status: "cancelled" }).where(eq(hotelBookingsTable.id, id)).returning();
    await db.update(hotelRoomsTable).set({ status: "available" }).where(eq(hotelRoomsTable.id, booking.roomId));

    const [user] = await db.select().from(hotelUsersTable).where(eq(hotelUsersTable.id, booking.userId));
    const [room] = await db.select().from(hotelRoomsTable).where(eq(hotelRoomsTable.id, booking.roomId));
    res.json({
      ...updated,
      totalPrice: parseFloat(updated.totalPrice),
      guestName: user?.name ?? "",
      roomNumber: room?.roomNumber ?? "",
      roomType: room?.roomType ?? "",
    });
  } catch (err) {
    req.log.error(err);
    res.status(400).json({ error: "Cancel failed" });
  }
});

router.get("/hotel/admin/stats", async (req, res) => {
  try {
    const [roomStats] = await db.select({
      total: sql<number>`count(*)`,
      booked: sql<number>`count(*) filter (where status = 'booked')`,
      available: sql<number>`count(*) filter (where status = 'available')`,
    }).from(hotelRoomsTable);

    const [userStats] = await db.select({ total: sql<number>`count(*)` }).from(hotelUsersTable);
    const [bookingStats] = await db.select({
      total: sql<number>`count(*)`,
      revenue: sql<number>`coalesce(sum(total_price::numeric), 0)`,
    }).from(hotelBookingsTable).where(eq(hotelBookingsTable.status, "confirmed"));

    res.json({
      totalRooms: Number(roomStats.total),
      bookedRooms: Number(roomStats.booked),
      availableRooms: Number(roomStats.available),
      totalUsers: Number(userStats.total),
      totalBookings: Number(bookingStats.total),
      revenue: Number(bookingStats.revenue),
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

router.get("/hotel/admin/bookings", async (req, res) => {
  try {
    const rows = await db
      .select({
        id: hotelBookingsTable.id,
        userId: hotelBookingsTable.userId,
        roomId: hotelBookingsTable.roomId,
        checkIn: hotelBookingsTable.checkIn,
        checkOut: hotelBookingsTable.checkOut,
        status: hotelBookingsTable.status,
        totalPrice: hotelBookingsTable.totalPrice,
        createdAt: hotelBookingsTable.createdAt,
        guestName: hotelUsersTable.name,
        roomNumber: hotelRoomsTable.roomNumber,
        roomType: hotelRoomsTable.roomType,
      })
      .from(hotelBookingsTable)
      .innerJoin(hotelUsersTable, eq(hotelBookingsTable.userId, hotelUsersTable.id))
      .innerJoin(hotelRoomsTable, eq(hotelBookingsTable.roomId, hotelRoomsTable.id));
    res.json(rows.map(r => ({ ...r, totalPrice: parseFloat(r.totalPrice) })));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

export default router;
