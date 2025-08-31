import dotenv from 'dotenv';

dotenv.config();

/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
        return [
            {
                source: "/ap1/v1/:path*",
            destination : `http://${process.env.BACKEND_ADRESS}:3001/api/v1/:path*`
            },
        ];
    },eslint: {
        ignoreDuringBuilds: true,
    },
};

export default nextConfig;
