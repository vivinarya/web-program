import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    algorithms: ["bubble", "selection", "insertion", "quick", "merge", "heap", "shell"]
  });
}
