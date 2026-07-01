import React, { useState } from "react";
import { Link } from "wouter";
import { useListHotelRooms } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

export default function Rooms() {
  const [type, setType] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");

  const queryParams: any = {};
  if (type !== "all") queryParams.type = type;
  if (status !== "all") queryParams.status = status;

  const { data: rooms, isLoading } = useListHotelRooms(queryParams);

  return (
    <div className="container mx-auto px-4 md:px-6 py-12">
      <div className="mb-12 text-center max-w-2xl mx-auto">
        <h1 className="font-serif text-4xl md:text-5xl text-foreground mb-4">Our Accommodations</h1>
        <p className="text-muted-foreground text-lg">
          Thoughtfully designed spaces for rest and reflection. Find your perfect sanctuary.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-8 justify-between items-center bg-card p-4 rounded-lg border shadow-sm">
        <div className="flex gap-4 w-full sm:w-auto">
          <div className="w-full sm:w-[200px]">
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder="Room Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="single">Single</SelectItem>
                <SelectItem value="double">Double</SelectItem>
                <SelectItem value="luxury">Luxury</SelectItem>
                <SelectItem value="suite">Suite</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-full sm:w-[200px]">
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Availability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="booked">Booked</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="w-full aspect-[4/3] rounded-md" />
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          ))}
        </div>
      ) : rooms?.length === 0 ? (
        <div className="text-center py-24 bg-muted/30 rounded-lg">
          <h3 className="font-serif text-2xl mb-2">No rooms found</h3>
          <p className="text-muted-foreground">Try adjusting your filters to see more results.</p>
          <Button variant="outline" className="mt-6" onClick={() => { setType("all"); setStatus("all"); }}>
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {rooms?.map((room) => (
            <Link key={room.id} href={`/rooms/${room.id}`}>
              <Card className="group cursor-pointer overflow-hidden border-transparent bg-transparent shadow-none hover:bg-muted/20 transition-colors">
                <CardContent className="p-0">
                  <div className="aspect-[4/3] overflow-hidden rounded-md mb-4 relative">
                    <img 
                      src={room.imageUrl || "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=2070&auto=format&fit=crop"} 
                      alt={`Room ${room.roomNumber}`} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    {room.status !== 'available' && (
                      <div className="absolute top-4 right-4 bg-black/70 text-white text-xs font-medium px-3 py-1 rounded backdrop-blur-md uppercase tracking-wider">
                        {room.status}
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between items-start px-2">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                        {room.roomType}
                      </p>
                      <h3 className="font-serif text-2xl mb-2 group-hover:text-primary transition-colors">
                        Room {room.roomNumber}
                      </h3>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-medium">₹{room.price}</p>
                      <p className="text-xs text-muted-foreground">per night</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
