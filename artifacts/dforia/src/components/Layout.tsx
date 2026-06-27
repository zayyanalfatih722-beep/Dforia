import React, { useEffect } from "react";
import { BottomNav } from "./BottomNav";
import { PageTransition } from "./PageTransition";
import { WhatsAppFloat } from "./WhatsAppFloat";
import { useLocation } from "wouter";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return (
    <div className="min-h-[100dvh] bg-background w-full flex justify-center">
      <div className="w-full max-w-[430px] bg-background relative shadow-2xl min-h-[100dvh] flex flex-col">
        <div className="flex-1 pb-24">
          <PageTransition key={location}>
            {children}
          </PageTransition>
        </div>
        <WhatsAppFloat />
        <BottomNav />
      </div>
    </div>
  );
}
