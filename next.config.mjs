/** @type {import('next').NextConfig} */
const nextConfig = {
	experimental: {
		viewTransition: true,
		// ppr: true, // PPR requires Next.js canary - using manual Suspense pattern instead
	},
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: '**.commercecloud.salesforce.com',
			},
			{
				protocol: 'https',
				hostname: '**.commercetools.com',
			},
			{
				protocol: 'https',
				hostname: '**.commercetools.co',
			},
			{
				protocol: 'https',
				hostname: '**.ctcdn.io',
			},
			{
				protocol: 'https',
				hostname: '**.ct-cdn.net',
			},
			// Google Cloud Storage (for commercetools sample data)
			{
				protocol: 'https',
				hostname: '**.googleapis.com',
			},
			// Agility CMS images
			{
				protocol: 'https',
				hostname: '**.agilitycms.com',
			},
			{
				protocol: 'https',
				hostname: '**.agilitycdn.com',
			},
		],
		// Optimize images for better performance
		formats: ['image/avif', 'image/webp'],
		deviceSizes: [96, 200, 400, 600, 800, 1000, 1200, 1600],
		imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
	},
}

export default nextConfig
