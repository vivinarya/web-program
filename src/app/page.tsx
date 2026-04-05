"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AntigravityBackground } from "@/components/AntigravityBackground";
import { DetonateButton } from "@/components/DetonateButton";
import { StatusFeed } from "@/components/StatusFeed";
import { PretextDiagnosticPanel, PretextMiniBar } from "@/components/PretextLoader";

type Action = 
  | { type: "COMPARE"; indices: number[] }
  | { type: "SWAP"; indices: number[] }
  | { type: "OVERWRITE"; index: number; value: number }
  | { type: "MARK_SORTED"; indices: number[] };

interface StatusMessage {
  id: string;
  text: string;
  type: "info" | "success" | "error" | "warning";
}

export default function Home() {
  const [array, setArray] = useState<number[]>([]);
  const [comparing, setComparing] = useState<number[]>([]);
  const [swapping, setSwapping] = useState<number[]>([]);
  const [sorted, setSorted] = useState<number[]>([]);
  const [availableAlgorithms, setAvailableAlgorithms] = useState<string[]>(["bubble"]);
  const [algorithm, setAlgorithm] = useState<string>("bubble");
  const [speed, setSpeed] = useState(50);
  const speedRef = useRef(50);
  const [messages, setMessages] = useState<StatusMessage[]>([]);
  const [progress, setProgress] = useState(0);
  const [isSorting, setIsSorting] = useState(false);
  const [arraySize, setArraySize] = useState(16);
  const [customInput, setCustomInput] = useState("");
  
  const sortTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const stopRequestedRef = useRef(false);

  const addMessage = (text: string, type: StatusMessage["type"] = "info") => {
    setMessages((prev) => [
      { id: Math.random().toString(36).substr(2, 9), text, type },
      ...prev.slice(0, 49),
    ]);
  };

  useEffect(() => {
    fetch("/api/algorithms")
      .then(res => res.json())
      .then(data => {
         setAvailableAlgorithms(data.algorithms || ["bubble"]);
      })
      .catch(err => console.error(err));
  }, []);

  const generateArray = useCallback(() => {
    let newArray: number[] = [];
    if (customInput.trim() !== "") {
        const parsed = customInput.split(",").map(n => parseInt(n.trim())).filter(n => !isNaN(n));
        if (parsed.length > 0) {
            newArray = parsed;
        }
    }
    
    if (newArray.length === 0) {
        newArray = Array.from({ length: arraySize }, () => Math.floor(Math.random() * 90) + 10);
    }
    
    setArray(newArray);
    setComparing([]);
    setSwapping([]);
    setSorted([]);
    setMessages([]);
    setProgress(0);
    addMessage("Initialized new entropy sequence.", "info");
  }, [arraySize, customInput]);

  useEffect(() => {
    generateArray();
  }, [generateArray]);

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const getDelay = () => {
    return 600 - (speedRef.current / 100) * 550;
  };

  const handleSpeedChange = (val: number) => {
    setSpeed(val);
    speedRef.current = val;
  };

  const startSort = async () => {
    if (isSorting) return;
    setIsSorting(true);
    stopRequestedRef.current = false;
    addMessage(`Execution phase: ${algorithm.toUpperCase()} SORT. Requesting payload...`, "info");
    
    try {
        const response = await fetch("/api/sort", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ array, algorithm })
        });
        
        const data = await response.json();
        const steps: Action[] = data.steps;

        if (!steps) throw new Error("No steps returned");
        
        addMessage(`Initiating payload playback: ${steps.length} ops.`, "success");
        
        const currentArr = [...array];
        const stepTotal = steps.length;
        
        for (let i = 0; i < stepTotal; i++) {
            if (stopRequestedRef.current) break;
            
            const step = steps[i];
            
            if (step.type === "COMPARE") {
                setComparing(step.indices);
                await sleep(getDelay());
            } else if (step.type === "SWAP") {
                setSwapping(step.indices);
                const [a, b] = step.indices;
                const temp = currentArr[a];
                currentArr[a] = currentArr[b];
                currentArr[b] = temp;
                setArray([...currentArr]);
                await sleep(getDelay() * 1.5);
                setSwapping([]);
            } else if (step.type === "OVERWRITE") {
                const { index: idx, value } = step;
                setSwapping([idx]);
                currentArr[idx] = value;
                setArray([...currentArr]);
                await sleep(getDelay() * 1.5);
                setSwapping([]);
            } else if (step.type === "MARK_SORTED") {
                setSorted((prev) => Array.from(new Set([...prev, ...step.indices])));
            }
            
            setComparing([]);
            setProgress(((i + 1) / stepTotal) * 100);
        }
        
    } catch (e) {
        addMessage(`Critical Error: API unresponsive.`, "error");
    }
    
    setProgress(100);
    setSwapping([]);
    setComparing([]);
    
    if (!stopRequestedRef.current) {
        addMessage("Process complete. Entropy minimized.", "success");
    }
    setIsSorting(false);
  };

  const detonate = () => {
    stopRequestedRef.current = true;
    setIsSorting(false);
    generateArray();
  };

  return (
    <div className="relative min-h-screen flex flex-col font-mono overflow-hidden text-zinc-100">
      <AntigravityBackground />
      <div className="noise-overlay" />

      {/* Header */}
      <header className="relative z-10 p-8 flex justify-between items-end border-b border-zinc-900 bg-black/60 backdrop-blur-md">
        <div className="space-y-1">
            <h1 className="text-2xl font-black tracking-tighter uppercase sm:text-4xl">AlgoVision <span className="text-zinc-600">:::</span> Engine</h1>
            <p className="text-[10px] text-zinc-500 tracking-[0.3em] uppercase">Computational Kinetic Visualizer // A-G S-01</p>
        </div>
        <div className="hidden sm:block text-right">
            <div className="text-[10px] text-zinc-600 uppercase mb-1">Status</div>
            <div className={`text-[11px] font-bold uppercase ${isSorting ? "text-white animate-pulse" : "text-zinc-700"}`}>
                {isSorting ? "Sorting..." : "Standby"}
            </div>
        </div>
      </header>

      {/* Main Layout */}
      <main className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-4 gap-0 lg:divide-x lg:divide-zinc-900 overflow-hidden">
        
        {/* Sidebar Controls */}
        <div className="p-8 flex flex-col gap-12 bg-black/40">
            <section className="space-y-6">
                <h2 className="text-[10px] text-zinc-600 tracking-widest uppercase">01 / Algorithm Select</h2>
                <div className="flex flex-col gap-2">
                    {availableAlgorithms.map((algo) => (
                        <button
                            key={algo}
                            onClick={() => !isSorting && setAlgorithm(algo)}
                            className={`text-left px-4 py-3 border transition-all duration-300 text-[11px] font-bold uppercase tracking-widest ${
                                algorithm === algo 
                                ? "bg-white text-black border-white" 
                                : "text-zinc-600 border-zinc-900 hover:border-zinc-700 hover:text-zinc-400"
                            }`}
                        >
                            {algo}
                        </button>
                    ))}
                </div>
            </section>

            <section className="space-y-6">
                <h2 className="text-[10px] text-zinc-600 tracking-widest uppercase">02 / Dimensions & Entropy</h2>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-[9px] text-zinc-500 uppercase">Array Size: {arraySize}</label>
                        <input 
                            type="range" 
                            min="4" max="64" 
                            value={arraySize}
                            onChange={(e) => setArraySize(Number(e.target.value))}
                            className="w-full h-1 bg-zinc-900 appearance-none cursor-pointer accent-white"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[9px] text-zinc-500 uppercase">Custom Input (Comma separated)</label>
                        <input 
                            type="text" 
                            value={customInput}
                            onChange={(e) => setCustomInput(e.target.value)}
                            placeholder="e.g. 50, 10, 99, 2"
                            className="w-full bg-black border border-zinc-900 text-[10px] p-2 text-zinc-300 focus:outline-none focus:border-zinc-500 transition-colors"
                        />
                    </div>
                </div>
            </section>

            <section className="space-y-6">
                <h2 className="text-[10px] text-zinc-600 tracking-widest uppercase">03 / Kinetic Speed</h2>
                <div className="space-y-4">
                    <input 
                        type="range" 
                        min="1" max="100" 
                        value={speed}
                        onChange={(e) => handleSpeedChange(Number(e.target.value))}
                        className="w-full h-1 bg-zinc-900 appearance-none cursor-pointer accent-white"
                    />
                    <div className="flex justify-between text-[9px] text-zinc-700 uppercase tracking-widest">
                        <span>Languid</span>
                        <span>Frenetic</span>
                    </div>
                </div>
            </section>

            <section className="mt-auto flex flex-col gap-3">
                <DetonateButton onClick={detonate} disabled={false}>
                    Detonate Array
                </DetonateButton>
                <DetonateButton onClick={startSort} disabled={isSorting}>
                    Initiate Execute
                </DetonateButton>
            </section>
        </div>

        {/* Visualizer Stage */}
        <div className="lg:col-span-2 p-8 flex flex-col items-center justify-center relative overflow-hidden bg-black/20">
            <div className="absolute top-8 left-8 text-[10px] text-zinc-800 tracking-widest uppercase flex flex-col gap-1">
                <span>Stage / Visual Buffer</span>
                {isSorting && <PretextMiniBar progress={progress} />}
            </div>
            
            <div className="absolute top-8 right-8 text-[10px] text-zinc-800 tracking-widest uppercase text-right">
                <span>Algo: {algorithm.toUpperCase()}</span>
            </div>
            
            <div className="flex gap-4 items-end h-64 w-full max-w-2xl px-8">
                {array.map((value, idx) => (
                    <motion.div
                        key={`${idx}-${value}`}
                        layout
                        initial={{ opacity: 0, y: 50, scale: 0.8 }}
                        animate={{ 
                            opacity: 1, 
                            y: 0, 
                            scale: 1,
                            backgroundColor: swapping.includes(idx) 
                                ? "#ffffff" 
                                : comparing.includes(idx)
                                ? "#ffffff"
                                : sorted.includes(idx)
                                ? "#171717"
                                : "transparent",
                            borderColor: sorted.includes(idx) ? "#262626" : "#ffffff",
                            height: `${Math.max(5, (value / Math.max(...array)) * 100)}%`
                        }}
                        transition={{
                            layout: { duration: 0.4, ease: [0.2, 0, 0, 1] },
                            height: { duration: 0.3 }
                        }}
                        className={`flex-1 border self-end flex flex-col items-center justify-end pb-4 group relative`}
                    >
                        <span className={`text-[12px] font-black mix-blend-difference`}>
                            {value}
                        </span>
                    </motion.div>
                ))}
            </div>
        </div>

        {/* Status Logs */}
        <div className="hidden lg:block border-l border-zinc-900 bg-black/40 flex flex-col">
            <div className="flex-1 overflow-y-auto">
                <StatusFeed messages={messages} />
            </div>
            <div className="border-t border-zinc-900">
                <PretextDiagnosticPanel isSorting={isSorting} progress={progress} />
            </div>
        </div>
      </main>

      <footer className="relative z-10 p-4 text-[9px] text-zinc-800 border-t border-zinc-900 bg-black flex justify-between tracking-widest uppercase">
          <span>Antigravity Engine // Verified</span>
          <span>© 2026 // DeepMind Advanced Coding</span>
      </footer>
    </div>
  );
}
