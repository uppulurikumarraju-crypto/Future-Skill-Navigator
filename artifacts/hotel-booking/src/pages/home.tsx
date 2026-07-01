import React from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex-1 flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[80vh] min-h-[600px] w-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-black/40 z-10" />
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1542314831-c53cd4b85ca4?q=80&w=2070&auto=format&fit=crop')" }}
        />
        <div className="relative z-20 container mx-auto px-4 md:px-6 text-center text-white">
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-medium tracking-tight mb-6 drop-shadow-sm">
            A sanctuary in <br className="hidden md:block"/> the city
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl font-light opacity-90 mb-10">
            Discover a world of understated luxury, where every detail is crafted for your perfect stay.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/rooms">
              <Button size="lg" className="h-14 px-8 text-base bg-white text-black hover:bg-white/90">
                Explore Rooms
              </Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="outline" className="h-14 px-8 text-base bg-transparent border-white text-white hover:bg-white/10 hover:text-white">
                Join our Membership
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Rooms Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-4">
            <div className="max-w-2xl">
              <h2 className="font-serif text-4xl md:text-5xl text-foreground mb-4">Curated spaces</h2>
              <p className="text-muted-foreground text-lg">Designed for rest, reflection, and rejuvenation.</p>
            </div>
            <Link href="/rooms" className="group flex items-center gap-2 text-primary font-medium hover:underline pb-2">
              View all accommodations
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="group cursor-pointer">
              <div className="aspect-[4/5] overflow-hidden rounded-md mb-6">
                <img 
                  src="https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=2070&auto=format&fit=crop" 
                  alt="Luxury Suite" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-serif text-2xl mb-1 group-hover:text-primary transition-colors">The Grand Suite</h3>
                  <p className="text-muted-foreground">Panoramic views, separate living area</p>
                </div>
              </div>
            </div>
            
            <div className="group cursor-pointer">
              <div className="aspect-[4/5] overflow-hidden rounded-md mb-6">
                <img 
                  src="https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1974&auto=format&fit=crop" 
                  alt="Double Room" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-serif text-2xl mb-1 group-hover:text-primary transition-colors">Premium Double</h3>
                  <p className="text-muted-foreground">Perfect for couples and quick getaways</p>
                </div>
              </div>
            </div>

            <div className="group cursor-pointer">
              <div className="aspect-[4/5] overflow-hidden rounded-md mb-6">
                <img 
                  src="https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=2070&auto=format&fit=crop" 
                  alt="Luxury Room" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-serif text-2xl mb-1 group-hover:text-primary transition-colors">Luxury Studio</h3>
                  <p className="text-muted-foreground">Spacious comfort with premium amenities</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Experience Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 aspect-square md:aspect-[4/3] rounded-md overflow-hidden">
               <img 
                  src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop" 
                  alt="Hotel Restaurant" 
                  className="w-full h-full object-cover"
                />
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="font-serif text-4xl md:text-5xl text-foreground mb-6 leading-tight">Taste the exceptional</h2>
              <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                Our award-winning culinary team crafts seasonal menus using locally sourced ingredients. Whether it's a quiet morning coffee in the courtyard or an elegant evening dinner, every meal is an experience to savor.
              </p>
              <Button variant="outline" className="h-12 px-6 text-base">
                Discover Dining
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
