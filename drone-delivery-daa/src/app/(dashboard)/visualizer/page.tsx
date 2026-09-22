import React from 'react';
import dynamic from 'next/dynamic';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';

// We must dynamically import the visualizer because Three.js relies on window/document, 
// which are not available during Server-Side Rendering (SSR).
const City3DVisualizer = dynamic(
  () => import('@/components/graph/City3DVisualizer'),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center bg-[#050a1f] text-cyan-500 w-full rounded-xl border border-white/10">
        Loading 3D Engine...
      </div>
    )
  }
);
export default function VisualizerPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 p-6 flex flex-col">
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-slate-100">3D Visualizer</h1>
            <p className="text-slate-400 text-sm mt-1">
              Cinematic 3D flight path visualization of drone routes across Meridian City.
            </p>
          </div>
          <div className="relative flex-1 rounded-xl overflow-hidden border border-white/10 min-h-[600px] shadow-2xl">
            <City3DVisualizer />
          </div>
        </main>
      </div>
    </div>
  );
}
