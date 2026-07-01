import React from "react";
import { useAuth } from "@/lib/auth";
import { useGetUserHotelBookings, useCancelHotelBooking } from "@workspace/api-client-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useQueryClient } from "@tanstack/react-query";
import { getGetUserHotelBookingsQueryKey } from "@workspace/api-client-react";

export default function Bookings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: bookings, isLoading } = useGetUserHotelBookings(user?.id as number, {
    query: { enabled: !!user?.id }
  });

  const cancelMutation = useCancelHotelBooking();

  const handleCancel = (bookingId: number) => {
    cancelMutation.mutate(
      { id: bookingId },
      {
        onSuccess: () => {
          toast({
            title: "Booking cancelled",
            description: "Your reservation has been cancelled.",
          });
          if (user?.id) {
            // Refetch to get updated list
            queryClient.invalidateQueries({ queryKey: getGetUserHotelBookingsQueryKey(user.id) });
          }
        },
        onError: () => {
          toast({
            title: "Cancellation failed",
            description: "We couldn't cancel your booking. Please contact support.",
            variant: "destructive"
          });
        }
      }
    );
  };

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 max-w-5xl">
      <div className="mb-10">
        <h1 className="font-serif text-4xl text-foreground mb-2">My Reservations</h1>
        <p className="text-muted-foreground text-lg">Manage your upcoming stays and view past bookings.</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      ) : bookings?.length === 0 ? (
        <div className="text-center py-24 bg-muted/20 rounded-xl border border-border border-dashed">
          <h3 className="font-serif text-2xl mb-2">No reservations found</h3>
          <p className="text-muted-foreground mb-6">You haven't booked any stays with us yet.</p>
          <Button asChild>
            <a href="/rooms">Explore our rooms</a>
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {bookings?.map((booking) => (
            <div key={booking.id} className="bg-card border border-border rounded-xl p-6 flex flex-col md:flex-row justify-between gap-6 shadow-sm">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-serif text-2xl">Room {booking.roomNumber}</h3>
                  <Badge variant={
                    booking.status === 'confirmed' ? 'default' : 
                    booking.status === 'cancelled' ? 'destructive' : 'secondary'
                  } className="capitalize">
                    {booking.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground uppercase tracking-wider mb-6">
                  {booking.roomType}
                </p>
                
                <div className="grid grid-cols-2 gap-4 max-w-md">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Check In</p>
                    <p className="font-medium">{format(new Date(booking.checkIn), "MMM dd, yyyy")}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Check Out</p>
                    <p className="font-medium">{format(new Date(booking.checkOut), "MMM dd, yyyy")}</p>
                  </div>
                </div>
              </div>
              
              <div className="md:border-l md:border-border md:pl-8 flex flex-col justify-between md:items-end">
                <div className="md:text-right mb-6">
                  <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
                  <p className="text-3xl font-serif">${booking.totalPrice}</p>
                </div>
                
                {booking.status === 'confirmed' && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10">
                        Cancel Reservation
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will cancel your reservation for Room {booking.roomNumber}. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Keep Booking</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleCancel(booking.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Yes, Cancel Reservation
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
