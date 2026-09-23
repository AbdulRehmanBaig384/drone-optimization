// src/app/page.tsx — Dashboard (redirects to main dashboard layout)
// This is the root page at "/" — shows summary stats

// import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { listDrones } from '@/services/droneService';
import { listDeliveries } from '@/services/deliveryService';
import { getAllAssignments } from '@/repositories/assignmentsRepo';
// Removed Sidebar and Navbar imports
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
  // const { userId } = await auth();
  // if (!userId) redirect('/sign-in');

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
    <>
      {/* Hero */}
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold font-display gradient-text mb-3">
          Drone Delivery Route Optimization
        </h1>
        <p className="text-text-dim text-sm max-w-2xl leading-relaxed">
          A Design & Analysis of Algorithms project implementing Dijkstra, A*, greedy scheduling,
          and a binary min-heap priority queue to optimize drone delivery routes across a city graph.
        </p>
      </div>

      {/* Stats grid */}
      {stats ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
          {cards.map(({ label, value, sub, icon: Icon, color, href }) => (
            <Link key={label} href={href}
              className={`glass-card p-5 flex flex-col gap-3 hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 ${colorMap[color]}`}
            >
              <div className="flex items-center gap-2">
                <Icon size={18} />
                <span className="text-xs font-semibold uppercase tracking-wider opacity-70">{label}</span>
              </div>
              <p className="text-4xl font-bold font-mono text-white tracking-tight">{value}</p>
              <p className="text-xs opacity-60 font-medium">{sub}</p>
            </Link>
          ))}
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-critical/10 border border-critical/30 text-critical text-sm flex items-start gap-3 mb-10">
          <span className="text-lg">⚠️</span>
          <div>
            <p className="font-bold mb-1">Database Connection Failed</p>
            <p className="opacity-80">Could not load stats. Check your Supabase connection in .env.local and ensure the seed.sql script has been run in the Supabase SQL Editor.</p>
          </div>
        </div>
      )}

      {/* Algorithm reference cards */}
      <h2 className="text-xl font-display font-semibold text-text-main mb-6">DAA Algorithms Implemented</h2>
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
            className={`p-5 rounded-xl border bg-surface-2/50 ${colorMap[color]} flex flex-col gap-3 transition-colors`}
          >
            <p className="font-bold font-display text-text-main">{title}</p>
            <p className="text-xs font-mono py-1 px-2 rounded bg-black/20 w-fit opacity-90">{complexity}</p>
            <p className="text-sm text-text-dim flex-1 leading-relaxed">{desc}</p>
            <p className="text-[10px] font-mono text-text-faint bg-black/10 p-1.5 rounded truncate">{file}</p>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="flex gap-4 flex-wrap">
        <Link href="/city-map" className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-surface border border-border-theme hover:bg-surface-2 hover:border-text-faint text-text-main text-sm font-medium transition-all shadow-lg">
          <Map size={16} /> View Sector Map
        </Link>
        <Link href="/simulation" className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-accent/10 border border-accent/30 hover:bg-accent/20 text-accent text-sm font-bold transition-all shadow-[0_0_15px_rgba(65,214,255,0.15)]">
          <Zap size={16} /> Run Simulation
        </Link>
      </div>
    </>
  );
}
