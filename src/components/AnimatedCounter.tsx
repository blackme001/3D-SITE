"use client";

import { useEffect, useRef } from "react";
import { animate } from "framer-motion";

interface AnimatedCounterProps {
  value: number;
}

export default function AnimatedCounter({ value }: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // Parse the previous value in the DOM (strip currency formatting)
    const textVal = node.textContent?.replace(/[$,]/g, "") || "0";
    const startVal = parseFloat(textVal) || 0;

    // Trigger smooth exponential ease-out animation
    const controls = animate(startVal, value, {
      duration: 1.4,
      ease: [0.16, 1, 0.3, 1], // Premium luxury ease-out
      onUpdate(val) {
        node.textContent = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          maximumFractionDigits: 0,
        }).format(val);
      },
    });

    return () => controls.stop();
  }, [value]);

  return (
    <span
      ref={ref}
      className="font-display font-semibold text-luxury-gold tracking-wide tabular-nums text-2xl md:text-3xl text-gold-glow"
    />
  );
}
