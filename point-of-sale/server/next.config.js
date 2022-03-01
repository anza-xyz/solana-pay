/** @type {import('next').NextConfig} */
const withSvgr = require("next-svgr");

const nextConfig = withSvgr({
    reactStrictMode: true,
});

module.exports = nextConfig;
