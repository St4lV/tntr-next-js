import dotenv from 'dotenv';
import withPWAInit from '@ducanh2912/next-pwa';

dotenv.config();

const withPWA = withPWAInit({
	dest: 'public',
	disable: false,//process.env.NODE_ENV === 'development',
});


/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        ignoreDuringBuilds: true,
    },
    compiler: {
        removeConsole: true,
    },
};

export default withPWA(nextConfig);
