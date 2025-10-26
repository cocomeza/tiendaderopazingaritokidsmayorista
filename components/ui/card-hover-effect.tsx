"use client";
import React from "react";
import { cn } from "@/lib/utils";

interface CardHoverEffectProps {
  children: React.ReactNode;
  className?: string;
}

export const CardHoverEffect = ({ children, className }: CardHoverEffectProps) => {
  return (
    <div
      className={cn(
        "relative group block p-2 h-full w-full",
        className
      )}
    >
      <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
      <div className="relative h-full w-full">
        {children}
      </div>
    </div>
  );
};
