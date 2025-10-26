"use client";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export const TextGenerateEffect = ({
  words,
  className,
  duration = 0.5,
}: {
  words: string;
  className?: string;
  duration?: number;
}) => {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < words.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + words[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, duration * 1000);

      return () => clearTimeout(timeout);
    }
  }, [currentIndex, words, duration]);

  return (
    <div className={cn("font-bold", className)}>
      <div className="mt-4">
        <div className="text-black dark:text-white text-2xl leading-snug tracking-wide">
          {displayedText.split(" ").map((word, idx) => (
            <span
              key={idx}
              className="dark:text-white text-black"
            >
              {word}{" "}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
