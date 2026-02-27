import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Transpilar o design system (pacote npm)
  // Isso garante que o Next.js/Turbopack processe corretamente os módulos ESM do pacote
  transpilePackages: ['@fabio.caffarello/react-design-system'],
};

export default nextConfig;
