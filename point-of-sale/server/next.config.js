/** @type {import('next').NextConfig} */
const withSvgr = require("next-svgr");

const nextConfig = withSvgr({
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
                ]
            }
        ]
    }
});

module.exports = nextConfig;
