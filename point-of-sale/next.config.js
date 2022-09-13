/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: [process.env.IMAGE_DOMAIN],
    },
    reactStrictMode: true,
    async redirects() {
        return [
            {
                source: '/',
                destination: '/new',
                permanent: false,
            },
        ];
    },
};

module.exports = nextConfig;
