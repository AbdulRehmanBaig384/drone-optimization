/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow reactflow and other client-only packages
  transpilePackages: ['reactflow'],
  // Supabase realtime uses websockets — allow in API routes
  serverExternalPackages: ['@supabase/supabase-js'],
};

module.exports = nextConfig;
