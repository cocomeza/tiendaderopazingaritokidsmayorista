"use client";
import React from "react";
import { cn } from "@/lib/utils";

export const HoverEffect = ({
  items,
  className,
}: {
  items: {
    title: string;
    description: string;
    link: string;
  }[];
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 py-10",
        className
      )}
    >
      {items.map((item, idx) => (
        <div
          key={idx}
          className="relative group block p-2 h-full w-full"
        >
          <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
          <div className="relative px-7 py-6 bg-white dark:bg-black rounded-lg leading-none flex items-top justify-between space-x-6">
            <div className="space-y-2">
              <p className="text-2xl font-bold text-black dark:text-white line-clamp-2">
                {item.title}
              </p>
              <p className="text-gray-600 dark:text-gray-300 line-clamp-3">
                {item.description}
              </p>
            </div>
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-black dark:bg-white text-white dark:text-black font-bold text-lg">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M13.025 1l-2.847 2.828 6.176 6.176h-16.354v3.992h16.354l-6.176 6.176 2.847 2.828 10.975-11z" />
              </svg>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
