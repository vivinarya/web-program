"use client";

import React, { useEffect, useRef, useState } from "react";
import { prepare, layout } from "@chenglou/pretext";
import { motion } from "framer-motion";

interface LoaderProps {
  progress: number;
  label: string;
  color?: string;
}

export const PretextLoader: React.FC<LoaderProps> = ({ progress, label, color = "white" }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [textLayout, setTextLayout] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const font = "9px 'JetBrains Mono', monospace";
  
  // High-performance layout calculation using pretext
  useEffect(() => {
    const text = `${label.toUpperCase()} ::: ${Math.round(progress)}%`;
    const prepared = prepare(text, font);
    const result = layout(prepared, 1000, 10);
    
    // In pretext 0.0.3, layout returns { height, prepared }
    // We cast to any if types are missing, or just use the height
    const width = (result as any).prepared?.reduce((acc: number, p: any) => acc + p.width, 0) || 0; 
    setTextLayout({ width: width, height: result.height });
  }, [progress, label]);

  const barChars = 30;
  const filledChars = Math.floor((progress / 100) * barChars);
  const barText = "[" + "=".repeat(filledChars) + ">" + "-".repeat(Math.max(0, barChars - filledChars - 1)) + "]";

  return (
    <div className="flex flex-col justify-end h-full gap-1 font-mono text-[9px] w-full max-w-[200px] mx-auto">
      <div className="flex justify-between items-end opacity-50 px-1">
        <span className="leading-tight">{label}</span>
        <span className="leading-tight">{Math.round(progress)}%</span>
      </div>
      <div className="relative h-[14px] bg-zinc-900 border border-zinc-800 overflow-hidden group">
        {/* The "Pretext" optimized background layer */}
        <div 
          className="absolute inset-0 flex items-center px-2 text-zinc-700 pointer-events-none whitespace-nowrap select-none"
          style={{ font }}
        >
          {barText}
        </div>
        
        {/* Animated fill bar */}
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="absolute inset-y-0 left-0 bg-white/20 backdrop-blur-sm border-r border-white/50"
        >
          <div className="absolute inset-0 animate-pulse bg-white/10" />
        </motion.div>

        {/* Glossy scanline effect */}
        <motion.div 
          animate={{ x: ["-100%", "200%"] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-[-20deg]"
        />
      </div>
    </div>
  );
};

export const PretextMiniBar: React.FC<{ progress: number }> = ({ progress }) => {
  const barChars = 20;
  const totalSteps = barChars * 4;
  const currentStep = Math.floor((progress / 100) * totalSteps);
  
  const chars = [" ", "░", "▒", "▓", "█"];
  let barText = "[";
  for (let i = 0; i < barChars; i++) {
    const blockStep = Math.min(4, Math.max(0, currentStep - i * 4));
    barText += chars[blockStep];
  }
  barText += "]";
  
  return (
    <div className="font-mono text-[9px] text-zinc-500 flex gap-4 items-center">
      <span className="tracking-tighter opacity-60 tabular-nums">{barText}</span>
      <span className="w-8 text-right tabular-nums">{Math.round(progress)}%</span>
    </div>
  );
};

export const PretextDiagnosticPanel: React.FC<{ isSorting: boolean; progress: number }> = ({ isSorting, progress }) => {
  return (
    <div className="p-4 flex flex-col gap-4 border-t border-zinc-900 bg-black/40 backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-1">
        <div className={`w-1.5 h-1.5 rounded-full ${isSorting ? "bg-green-500 animate-pulse" : "bg-zinc-800"}`} />
        <span className="text-[10px] text-zinc-500 tracking-widest uppercase">System Flux Dynamics</span>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 items-end">
        <PretextLoader label="Entropy Resolution" progress={progress} />
        <PretextLoader label="Array Density" progress={85} />
        <PretextLoader label="Kinetic Velocity" progress={isSorting ? 92 : 0} />
      </div>

      <div className="mt-2 text-[8px] text-zinc-700 uppercase tracking-tighter flex gap-4 overflow-hidden whitespace-nowrap border-t border-zinc-900 pt-3">
        <span className="animate-marquee inline-block">
          CPU_LOAD: 0.12% // MEM_TOTAL: 64GB // LATENCY: 2ms // KINETIC_BUFFER: 0xA4F2 // SYSTEM_READY // 
        </span>
        <span className="animate-marquee inline-block">
          CPU_LOAD: 0.12% // MEM_TOTAL: 64GB // LATENCY: 2ms // KINETIC_BUFFER: 0xA4F2 // SYSTEM_READY // 
        </span>
      </div>
    </div>
  );
};
