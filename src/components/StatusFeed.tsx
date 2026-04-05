"use client";

import React, { useEffect, useState, useRef } from "react";
import { prepare, layout } from "@chenglou/pretext";

interface StatusMessage {
  id: string;
  text: string;
  type: "info" | "success" | "error" | "warning";
}

interface StatusFeedProps {
  messages: StatusMessage[];
}

export const StatusFeed: React.FC<StatusFeedProps> = ({ messages }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [layoutData, setLayoutData] = useState<{ id: string; height: number }[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;
    const width = containerRef.current.clientWidth - 40; // Account for padding
    
    const newLayoutData = messages.map((msg) => {
      // Use pretext to predict height without rendering
      const prepared = prepare(msg.text, "12px 'JetBrains Mono', monospace");
      const { height } = layout(prepared, width, 18); // 18 is line height
      return { id: msg.id, height };
    });

    setLayoutData(newLayoutData);
  }, [messages]);

  return (
    <div 
      ref={containerRef}
      className="brutalist-card p-6 h-full flex flex-col font-mono text-[12px] bg-black border-zinc-800 overflow-y-auto scrollbar-hide"
    >
      <div className="mb-4 text-zinc-600 border-b border-zinc-800 pb-2 uppercase tracking-widest text-[10px]">
        Diagnostic Feed ::: v0.2.1
      </div>
      <div className="flex flex-col gap-3">
        {messages.map((msg) => (
          <div key={msg.id} className="flex gap-3 items-start animate-in fade-in slide-in-from-left duration-300">
            <span className="text-zinc-700 select-none">{">"}</span>
            <span className={`flex-1 ${msg.type === "error" ? "text-red-500" : msg.type === "success" ? "text-green-500" : "text-zinc-400"}`}>
              {msg.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
