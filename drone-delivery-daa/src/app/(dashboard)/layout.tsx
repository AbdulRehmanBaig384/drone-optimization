// src/app/(dashboard)/layout.tsx
import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-bg text-text-main flex-col md:flex-row">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 md:ml-[76px]">
        <Navbar />
        <main className="flex-1 p-[28px] max-w-7xl mx-auto w-full pb-24 md:pb-[28px] mt-16">
          {children}
        </main>
      </div>
    </div>
  );
}
