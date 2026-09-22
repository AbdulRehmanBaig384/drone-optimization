// src/app/(auth)/sign-in/[[...sign-in]]/page.tsx
import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500 to-violet-600 flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-bold">D</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-100">Drone Delivery DAA</h1>
          <p className="text-slate-400 text-sm mt-1">Sign in to access the simulation</p>
        </div>
        <SignIn />
      </div>
    </div>
  );
}
