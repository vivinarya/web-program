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
            <h1 className="text-3xl font-black tracking-tighter uppercase sm:text-5xl glimmer-hover-text cursor-default">AlgoVision <span className="text-zinc-600">:::</span> Engine</h1>
            <p className="text-[12px] text-zinc-500 tracking-[0.3em] uppercase">Computational Kinetic Visualizer // A-G S-01</p>
        </div>
      </header>

      {/* Main Layout */}
      <main className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-4 gap-0 lg:divide-x lg:divide-zinc-900 overflow-hidden">
        
        {/* Sidebar Controls */}
        <div className="p-8 flex flex-col gap-12 bg-black/40">
            <section className="space-y-6">
                <h2 className="text-xs text-zinc-500 tracking-widest uppercase">01 / Algorithm Select</h2>
                <div className="flex flex-col gap-3">
                    {availableAlgorithms.map((algo) => (
                        <button
                            key={algo}
                            onClick={() => !isSorting && setAlgorithm(algo)}
                            className={`text-left px-5 py-4 border transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] text-sm font-bold uppercase tracking-widest ${
                                algorithm === algo 
                                ? "bg-white text-black border-white shadow-lg" 
                                : "text-zinc-500 border-zinc-800 hover:border-zinc-500 hover:text-zinc-300"
                            }`}
                        >
                            {algo}
                        </button>
                    ))}
                </div>
            </section>

            <section className="space-y-6">
                <h2 className="text-xs text-zinc-500 tracking-widest uppercase">02 / Dimensions & Entropy</h2>
                <div className="space-y-6">
                    <div className="space-y-3">
                        <label className="text-xs text-zinc-400 uppercase tracking-widest">Array Size: {arraySize}</label>
                        <input 
                            type="range" 
                            min="4" max="64" 
                            value={arraySize}
                            onChange={(e) => setArraySize(Number(e.target.value))}
                            className="w-full h-1 bg-zinc-900 appearance-none cursor-pointer accent-white"
                        />
                    </div>
                    <div className="space-y-3">
                        <label className="text-xs text-zinc-400 uppercase tracking-widest">Custom Input (Comma separated)</label>
                        <input 
                            type="text" 
                            value={customInput}
                            onChange={(e) => setCustomInput(e.target.value)}
                            placeholder="e.g. 50, 10, 99, 2"
                            className="w-full bg-black border border-zinc-800 text-sm p-4 text-zinc-200 focus:outline-none focus:border-zinc-400 transition-colors"
                        />
                    </div>
                </div>
            </section>

            <section className="space-y-6">
                <h2 className="text-xs text-zinc-500 tracking-widest uppercase">03 / Kinetic Speed</h2>
                <div className="space-y-4">
                    <input 
                        type="range" 
                        min="1" max="100" 
                        value={speed}
                        onChange={(e) => handleSpeedChange(Number(e.target.value))}
                        className="w-full h-1.5 bg-zinc-800 appearance-none cursor-pointer accent-white"
                    />
                    <div className="flex justify-between text-[10px] text-zinc-500 uppercase tracking-widest">
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
                <DetonateButton onClick={() => stopRequestedRef.current = true} disabled={!isSorting}>
                    Halt Execution
                </DetonateButton>
            </section>
        </div>

        {/* Visualizer Stage */}
        <div className="lg:col-span-2 p-8 flex flex-col items-center justify-center relative overflow-hidden bg-black/20">
            <div className="absolute top-8 left-8 text-xs text-zinc-700 tracking-widest uppercase flex flex-col gap-1">
                <span>Stage / Visual Buffer</span>
                {isSorting && <PretextMiniBar progress={progress} />}
            </div>
            
            <div className="absolute top-8 right-8 text-xs text-zinc-700 tracking-widest uppercase text-right">
                <span>Algo: {algorithm.toUpperCase()}</span>
            </div>
            
            <div className={`flex items-end h-64 w-full px-4 sm:px-8 max-w-full lg:max-w-4xl overflow-hidden ${array.length > 32 ? 'gap-[1px]' : 'gap-2'}`}>
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
                        className={`flex-1 border min-w-[2px] self-end flex flex-col items-center justify-end pb-0 sm:pb-1 group relative overflow-visible`}
                    >
                        <span className={`font-black mix-blend-difference ${array.length > 32 ? "text-[7px]" : array.length > 24 ? "text-[9px]" : "text-xs"} mb-[2px]`}>
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
