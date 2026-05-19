/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['dexie', 'dexie-react-hooks'],
};

export default nextConfig;

import('@opennextjs/cloudflare').then(m => m.initOpenNextCloudflareForDev());
