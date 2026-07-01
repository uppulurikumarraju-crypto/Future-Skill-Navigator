import React from "react";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { format } from "date-fns";
import { 
  useGetHotelAdminStats, 
  useListAllHotelBookings 
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, BedDouble, CalendarCheck, DollarSign } from "lucide-react";

export default function Admin() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect if not admin
  if (user && user.role !== "admin") {
    setLocation("/");
    return null;
  }

  const { data: stats, isLoading: statsLoading } = useGetHotelAdminStats({
    query: { enabled: !!user && user.role === "admin" }
  });

  const { data: bookings, isLoading: bookingsLoading } = useListAllHotelBookings({
    query: { enabled: !!user && user.role === "admin" }
  });

  if (statsLoading || bookingsLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="font-serif text-3xl mb-8">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
        </div>
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-8">
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-foreground">Management Dashboard</h1>
        <p className="text-muted-foreground">Overview of Grand Stay operations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats?.revenue.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Bookings</CardTitle>
            <CalendarCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalBookings}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Room Occupancy</CardTitle>
            <BedDouble className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.bookedRooms} / {stats?.totalRooms}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.availableRooms} rooms available
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Guests</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers}</div>
          </CardContent>
        </Card>
      </div>

      <h2 className="font-serif text-2xl mb-4">Recent Bookings</h2>
      <div className="border border-border rounded-lg bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Guest</TableHead>
              <TableHead>Room</TableHead>
              <TableHead>Dates</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings?.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell className="font-medium">{booking.guestName}</TableCell>
                <TableCell>
                  Room {booking.roomNumber}
                  <span className="text-xs text-muted-foreground block uppercase">{booking.roomType}</span>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {format(new Date(booking.checkIn), "MMM dd")} - {format(new Date(booking.checkOut), "MMM dd, yyyy")}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={
                    booking.status === 'confirmed' ? 'default' : 
                    booking.status === 'cancelled' ? 'destructive' : 'secondary'
                  }>
                    {booking.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">${booking.totalPrice}</TableCell>
              </TableRow>
            ))}
            {bookings?.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No bookings found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
