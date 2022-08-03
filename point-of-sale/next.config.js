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
                has: [
                    {
                        type: 'query',
                        key: 'recipient',
                    },
                    {
                        type: 'query',
                        key: 'label',
                    },
                ],
            },
            {
                source: '/',
                destination: '/new',
                permanent: false,
                has: [
                    {
                        type: 'query',
                        key: 'id',
                    },
                ],
            },
        ];
    },
};

module.exports = nextConfig;
