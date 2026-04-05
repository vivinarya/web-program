# AlgoVision ::: Engine
**A Brutalist High-Performance Kinetic Visualizer**
*Built by DeepMind Advanced Coding // Antigravity*

AlgoVision is a monochrome, state-of-the-art sorting visualizer utilizing advanced React paradigms. Instead of mechanically resolving loops client-side, the engine connects to a headless API backend to farm algorithmic instructions, which are then physically executed via dynamic fractional scaling and spring physics. 

## Features
- **Uncoupled Execution**: Sorting algorithms (Quick, Merge, Heap, etc.) run in real-time Node.js APIs (`/api/sort`), allowing for O(N log N) logic to be perfectly converted into an action tape for React playback.
- **Micro-Animations**: Uses `framer-motion` for complex swapping logic. 
- **Pretext Diagnostic System**: Implements `@chenglou/pretext` to calculate incredibly fast text layout geometries, rendering sub-character progress bars (`░▒▓█`) and floating HUD diagnostics. 
- **Kinetic Scrubbing**: Allows React state refs to intercept speeds un-bottlenecked by asynchronous loop closures.

## Installation & Setup

1. **Clone and Install Dependencies**
   Run the following from your terminal:
   ```bash
   npm install
   ```

2. **Core Dependencies Downloaded**
   This project relies on several explicit architecture packages. Running `npm install` brings in:
   - `framer-motion`: For physics-based spring layout animations.
   - `@chenglou/pretext`: The high-performance layout/text loading visualizer.
   - `tailwindcss` / `clsx` / `tailwind-merge`: For the stark, brutalist monochrome designs.

3. **Start the Engine**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

## Configuration Notes
We are utilizing Next.js 15+ React Compiler. If you are developing over a network (e.g. running the server on a host machine while connecting from a VM or local IP like `192.168.56.1`), HMR (Hot Module Replacement) might block connections.
We have resolved this in `next.config.ts` via the `allowedDevOrigins` flag. If you require adding custom IP addresses, append them to `allowedDevOrigins` inside the config file list!

## Modding & Adding Algorithms
Because this engine operates out of a Headless API:
1. Append your algorithm string name to `GET` in `/api/algorithms/route.ts`.
2. Write a new step-generator function in `/api/sort/route.ts` that pushes `COMPARE`, `SWAP`, `OVERWRITE`, and `MARK_SORTED` hooks. 
3. Refresh the engine. The system will handle the rest autonomously.
