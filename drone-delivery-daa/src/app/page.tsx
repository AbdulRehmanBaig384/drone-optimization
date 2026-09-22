// src/app/page.tsx — Dashboard (redirects to main dashboard layout)
// This is the root page at "/" — shows summary stats

import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { listDrones } from '@/services/droneService';
import { listDeliveries } from '@/services/deliveryService';
import { getAllAssignments } from '@/repositories/assignmentsRepo';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import { Bot, Package, CheckCircle, Clock, Zap, Map } from 'lucide-react';
import Link from 'next/link';

async function getStats() {
  try {
    const [drones, deliveries, assignments] = await Promise.all([
      listDrones(),
      listDeliveries(),
      getAllAssignments(),
    ]);
    return {
      totalDrones: drones.length,
      availableDrones: drones.filter((d) => d.status === 'available').length,
      pendingDeliveries: deliveries.filter((d) => d.status === 'pending').length,
      activeDeliveries: deliveries.filter((d) => d.status === 'assigned' || d.status === 'in_flight').length,
      completedDeliveries: deliveries.filter((d) => d.status === 'delivered').length,
      totalAssignments: assignments.length,
    };
  } catch {
    return null;
  }
}

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const stats = await getStats();

  const cards = [
    { label: 'Total Drones',    value: stats?.totalDrones       ?? '–', sub: `${stats?.availableDrones ?? 0} available`, icon: Bot,          color: 'sky',    href: '/drones' },
    { label: 'Pending',         value: stats?.pendingDeliveries ?? '–', sub: 'awaiting assignment',                       icon: Clock,         color: 'amber',  href: '/deliveries' },
    { label: 'Active',          value: stats?.activeDeliveries  ?? '–', sub: 'in flight / assigned',                     icon: Zap,           color: 'violet', href: '/deliveries' },
    { label: 'Completed',       value: stats?.completedDeliveries ?? '–', sub: 'delivered successfully',                  icon: CheckCircle,   color: 'emerald',href: '/deliveries' },
    { label: 'Assignments',     value: stats?.totalAssignments  ?? '–', sub: 'total route computations',                 icon: Package,       color: 'rose',   href: '/simulation' },
  ];

  const colorMap: Record<string, string> = {
    sky:     'border-sky-500/30 bg-sky-500/10 text-sky-400',
    amber:   'border-amber-500/30 bg-amber-500/10 text-amber-400',
    violet:  'border-violet-500/30 bg-violet-500/10 text-violet-400',
    emerald: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
    rose:    'border-rose-500/30 bg-rose-500/10 text-rose-400',
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 p-8">
          {/* Hero */}
          <div className="mb-10">
            <h1 className="text-3xl font-bold gradient-text mb-2">
              Drone Delivery Route Optimization
            </h1>
            <p className="text-slate-400 text-sm max-w-2xl">
              A Design &amp; Analysis of Algorithms project implementing Dijkstra, A*, greedy scheduling,
              and a binary min-heap priority queue to optimize drone delivery routes across a city graph.
            </p>
          </div>

          {/* Stats grid */}
          {stats ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
              {cards.map(({ label, value, sub, icon: Icon, color, href }) => (
                <Link key={label} href={href}
                  className={`rounded-xl border p-5 flex flex-col gap-3 hover:scale-[1.02] transition-transform ${colorMap[color]}`}
                >
                  <div className="flex items-center gap-2">
                    <Icon size={18} />
                    <span className="text-xs font-semibold uppercase tracking-wider opacity-70">{label}</span>
                  </div>
                  <p className="text-3xl font-bold text-white">{value}</p>
                  <p className="text-xs opacity-60">{sub}</p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-6 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm mb-10">
              ⚠️ Could not load stats — check your Supabase connection and run the seed SQL.
            </div>
          )}

          {/* Algorithm reference cards */}
          <h2 className="text-lg font-semibold text-slate-300 mb-4">DAA Algorithms Implemented</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {[
              {
                title: 'Dijkstra\'s Algorithm',
                complexity: 'O((V+E) log V)',
                desc: 'Shortest path with configurable weight function (distance or energy). Uses binary min-heap.',
                file: 'src/algorithms/pathfinding/dijkstra.ts',
                color: 'sky',
              },
              {
                title: 'A* Search',
                complexity: 'O((V+E) log V)',
                desc: 'Informed search using admissible Euclidean heuristic. Explores fewer nodes than Dijkstra.',
                file: 'src/algorithms/pathfinding/astar.ts',
                color: 'violet',
              },
              {
                title: 'Greedy Scheduling',
                complexity: 'O(log n) dequeue',
                desc: 'Priority queue of deliveries (min-heap by priority + age). Always serves most urgent first.',
                file: 'src/algorithms/assignment/greedyPriorityOrder.ts',
                color: 'amber',
              },
              {
                title: 'Greedy Drone Assignment',
                complexity: 'O(D) per delivery',
                desc: 'Selects nearest available drone with sufficient battery. Falls back to next candidate.',
                file: 'src/algorithms/assignment/greedyDroneSelect.ts',
                color: 'emerald',
              },
            ].map(({ title, complexity, desc, file, color }) => (
              <div
                key={title}
                className={`p-4 rounded-xl border ${colorMap[color]} flex flex-col gap-2`}
              >
                <p className="font-bold text-sm text-slate-100">{title}</p>
                <p className="text-xs font-mono opacity-80">{complexity}</p>
                <p className="text-xs text-slate-400 flex-1">{desc}</p>
                <p className="text-[10px] font-mono text-slate-600">{file}</p>
              </div>
            ))}
          </div>

          {/* Quick links */}
          <div className="flex gap-3 flex-wrap">
            <Link href="/city-map" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-colors">
              <Map size={14} /> View City Map
            </Link>
            <Link href="/simulation" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold transition-colors">
              <Zap size={14} /> Run Simulation
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}
