/** @type {import('next').NextConfig} */
const nextConfig = {
  // Sequelize requires these packages to be externalized in server components
  serverExternalPackages: ["sequelize", "mysql2"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
