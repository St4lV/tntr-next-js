/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
        return [
            {
                source: "/ap1/v1/:path*",
            destination : "http://localhost:3001/api/v1/:path*"
            },
        ];
    },eslint: {
        ignoreDuringBuilds: true,
    },
};

export default nextConfig;
