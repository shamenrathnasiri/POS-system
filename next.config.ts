/** @type {import('next').NextConfig} */
const nextConfig = {
  // Sequelize requires these packages to be externalized in server components
  serverExternalPackages: ["sequelize", "mysql2"],
};

export default nextConfig;
