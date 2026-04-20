"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  label?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
}

export function SectionHeading({ label, title, subtitle, align = "center" }: SectionHeadingProps) {
  return (
    <div className={cn(
      "flex flex-col mb-20",
      align === "center" ? "items-center text-center mx-auto" : "items-start text-left"
    )}>
      {label && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0 }}
          className="inline-flex items-center gap-1.5 mb-4"
        >
          <div className="w-[6px] h-[6px] rounded-full bg-[#8b5cf6]" />
          <span className="text-[12px] font-medium tracking-[0.1em] text-[#8b5cf6] uppercase">
            {label.replace(/^●?\s*/, '')}
          </span>
        </motion.div>
      )}

      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        style={{ 
           fontSize: "clamp(32px, 4vw, 44px)",
           fontWeight: 700,
           lineHeight: 1.15,
           letterSpacing: "-0.02em",
           color: "#f1f5f9"
        }}
        className="font-display"
      >
        {title}
      </motion.h2>

      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          style={{ fontSize: "16px", color: "rgba(255,255,255,0.45)", lineHeight: 1.6 }}
          className="mt-4 max-w-[520px]"
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
}
