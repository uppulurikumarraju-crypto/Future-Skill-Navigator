import React, { useState } from "react";
import { useParams, useLocation, Link } from "wouter";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Users, Wind, Wifi, Coffee, Tv } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useGetHotelRoom, useCreateHotelBooking } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function RoomDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [date, setDate] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });

  const { data: room, isLoading } = useGetHotelRoom(Number(id), {
    query: { enabled: !!id }
  });

  const bookMutation = useCreateHotelBooking();

  const handleBook = () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to book a room.",
      });
      setLocation("/login");
      return;
    }

    if (!date.from || !date.to) {
      toast({
        title: "Dates required",
        description: "Please select check-in and check-out dates.",
        variant: "destructive"
      });
      return;
    }

    bookMutation.mutate({
      data: {
        userId: user.id,
        roomId: Number(id),
        checkIn: format(date.from, "yyyy-MM-dd"),
        checkOut: format(date.to, "yyyy-MM-dd")
      }
    }, {
      onSuccess: () => {
        toast({
          title: "Booking confirmed",
          description: "Your room has been booked successfully.",
        });
        setLocation("/bookings");
      },
      onError: (error: any) => {
        toast({
          title: "Booking failed",
          description: error?.response?.data?.message || "Could not complete booking",
          variant: "destructive"
        });
      }
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Skeleton className="w-full h-[60vh] rounded-xl mb-8" />
        <div className="grid md:grid-cols-3 gap-12">
          <div className="md:col-span-2 space-y-4">
            <Skeleton className="h-10 w-1/2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <div><Skeleton className="h-[300px] w-full rounded-xl" /></div>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h2 className="font-serif text-3xl mb-4">Room not found</h2>
        <Link href="/rooms">
          <Button variant="outline">Back to Rooms</Button>
        </Link>
      </div>
    );
  }

  const isAvailable = room.status === 'available';

  return (
    <div>
      <div className="w-full h-[60vh] min-h-[400px] relative">
        <img 
          src={room.imageUrl || "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=2070&auto=format&fit=crop"} 
          alt={`Room ${room.roomNumber}`}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16 text-white container mx-auto">
          <p className="text-sm font-medium tracking-widest uppercase mb-2 opacity-90">{room.roomType} Suite</p>
          <h1 className="font-serif text-5xl md:text-7xl font-medium">Room {room.roomNumber}</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-16">
        <div className="grid md:grid-cols-3 gap-12 lg:gap-24">
          <div className="md:col-span-2">
            <div className="flex gap-8 border-b border-border pb-8 mb-8">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-5 w-5" />
                <span>Sleeps {room.capacity || 2}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Wind className="h-5 w-5" />
                <span>Climate Control</span>
              </div>
            </div>
            
            <h2 className="font-serif text-3xl mb-6">About this space</h2>
            <div className="prose prose-lg text-muted-foreground mb-12">
              <p>{room.description}</p>
            </div>

            <h3 className="font-serif text-2xl mb-6">Amenities</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Wifi className="h-5 w-5" /> <span>High-speed WiFi</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <Coffee className="h-5 w-5" /> <span>Espresso Machine</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <Tv className="h-5 w-5" /> <span>Smart TV</span>
              </div>
            </div>
          </div>

          <div>
            <div className="sticky top-28 bg-card border border-border p-6 rounded-xl shadow-sm">
              <div className="flex items-end gap-2 mb-6 border-b border-border pb-6">
                <span className="text-4xl font-serif">${room.price}</span>
                <span className="text-muted-foreground mb-1">/ night</span>
              </div>

              {!isAvailable ? (
                <div className="bg-destructive/10 text-destructive p-4 rounded-md text-center font-medium mb-4">
                  Currently {room.status}
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Select Dates</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date?.from ? (
                            date.to ? (
                              <>
                                {format(date.from, "LLL dd, y")} -{" "}
                                {format(date.to, "LLL dd, y")}
                              </>
                            ) : (
                              format(date.from, "LLL dd, y")
                            )
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          initialFocus
                          mode="range"
                          defaultMonth={date?.from}
                          selected={date}
                          onSelect={(newDate: any) => setDate(newDate)}
                          numberOfMonths={2}
                          disabled={(d) => d < new Date(new Date().setHours(0,0,0,0))}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <Button 
                    className="w-full h-12 text-lg" 
                    onClick={handleBook}
                    disabled={bookMutation.isPending || !date.from || !date.to}
                  >
                    {bookMutation.isPending ? "Confirming..." : "Reserve Now"}
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">You won't be charged yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
