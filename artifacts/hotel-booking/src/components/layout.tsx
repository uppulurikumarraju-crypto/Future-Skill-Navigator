import React from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  return (
    <div className="min-h-[100dvh] flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 md:px-6 flex h-20 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <span className="font-serif text-2xl font-bold text-primary tracking-tight">Grand Stay</span>
          </Link>

          <nav className="flex items-center gap-6">
            <Link href="/rooms" className="text-sm font-medium transition-colors hover:text-primary">
              Rooms
            </Link>
            
            {user ? (
              <>
                <Link href="/bookings" className="text-sm font-medium transition-colors hover:text-primary">
                  My Bookings
                </Link>
                {user.role === 'admin' && (
                  <Link href="/admin" className="text-sm font-medium transition-colors hover:text-primary">
                    Dashboard
                  </Link>
                )}
                <Button variant="ghost" onClick={handleLogout}>
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium transition-colors hover:text-primary">
                  Sign In
                </Link>
                <Link href="/register" className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90">
                  Book Now
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
      
      <main className="flex-1 flex flex-col">
        {children}
      </main>

      <footer className="border-t border-border/40 bg-muted/20 py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-4">
              <span className="font-serif text-2xl font-bold text-primary tracking-tight">Grand Stay</span>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Experience unparalleled comfort and boutique hospitality in the heart of the city.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Stay</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/rooms">Our Rooms</Link></li>
                <li><Link href="/rooms?type=suite">Suites</Link></li>
                <li>Offers</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Hotel</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>About Us</li>
                <li>Dining</li>
                <li>Spa & Wellness</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Contact</li>
                <li>Instagram</li>
                <li>Journal</li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Grand Stay Hotel. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
