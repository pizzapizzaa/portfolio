// Projects as planets on the star map. Planet visuals are derived from these fields:
//   domain → planet colour (see domainColors), size → planet radius, orbit → ring index (0 = closest to the star)
//   status 'uncharted' → case study not written yet (page still has the template); rendered muted + static.

export type MissionDomain = 'climate' | 'fintech' | 'community' | 'sport' | 'consumer';

export interface Mission {
	slug: string;
	title: string;
	shortTitle: string;
	description: string;
	image: string;
	href: string;
	role: string;
	domain: MissionDomain;
	size: 'sm' | 'md' | 'lg';
	orbit: 0 | 1 | 2 | 3;
	status: 'charted' | 'uncharted';
}

export const domainColors: Record<MissionDomain, string> = {
	climate: '#41B774',
	fintech: '#90A3CF',
	community: '#4FD1C5',
	sport: '#F58A3A',
	consumer: '#D3ED66',
};

export const missions: Mission[] = [
	{
		slug: 'e-america',
		title: 'e-America',
		shortTitle: 'e-America',
		description: 'Designed a global community platform enabling real-time knowledge exchange across 70+ countries.',
		image: '/assets/projects/e-america/Events.png',
		href: '/projects/e-america',
		role: 'Lead Product Designer',
		domain: 'community',
		size: 'md',
		orbit: 2,
		status: 'charted',
	},
	{
		slug: 'boulder-box-saigon',
		title: "Boulder Box Saigon - Vietnam's First Boutique Bouldering Concept",
		shortTitle: 'Boulder Box Saigon',
		description: 'Designed, built, and (virtually) manage a top-rated bouldering gym in Saigon, Vietnam.',
		image: '/assets/projects/bbo-image-01.avif',
		href: '/projects/boulder-box-saigon',
		role: 'Founder & BD Head',
		domain: 'sport',
		size: 'lg',
		orbit: 1,
		status: 'charted',
	},
	{
		slug: 'bom-bom-singapore',
		title: 'BOM BOM SINGAPORE',
		shortTitle: 'BOM BOM SINGAPORE',
		description: 'Led the website revamp for a personalised fresh pet-food brand in Singapore, with 30% more website visitors and 20% more returning visitors one month after launch.',
		image: '/assets/projects/bom-bom-homepage.webp',
		href: '/projects/bom-bom-singapore',
		role: 'Lead Designer',
		domain: 'consumer',
		size: 'md',
		orbit: 1,
		status: 'charted',
	},
	{
		slug: 'boulder-box-pos-system',
		title: 'Boulder Box POS System',
		shortTitle: 'Boulder Box POS',
		description: 'A gym operations platform for customer check-ins, staff workflows, and day-to-day business management.',
		image: '/assets/projects/bbo-image-01.avif',
		href: '/projects/boulder-box-pos-system',
		role: 'Founder & Business Development Head',
		domain: 'sport',
		size: 'md',
		orbit: 2,
		status: 'charted',
	},
	{
		slug: 'verity-nature-mrv',
		title: 'Verity Nature MRV',
		shortTitle: 'Verity Nature MRV',
		description: 'An end-to-end digital MRV platform for high integrity carbon credit cycle.',
		image: '/assets/projects/verity-mrv-01.jpg',
		href: '/projects/verity-nature-mrv',
		role: 'Senior Product Manager (Execution & Rollouts)',
		domain: 'climate',
		size: 'lg',
		orbit: 0,
		status: 'charted',
	},
	{
		slug: 'verity-east-africa',
		title: 'Verity East Africa Reforestation',
		shortTitle: 'Verity East Africa',
		description: 'A community-centred digital product suite supporting large-scale tree planting and transparent reforestation work in Kenya.',
		image: '/assets/projects/verity-01.avif',
		href: '/projects/verity-east-africa',
		role: 'Product Manager & Lead Designer',
		domain: 'climate',
		size: 'md',
		orbit: 1,
		status: 'charted',
	},
	{
		slug: 'mbfs-sea',
		title: 'Mercedes-Benz Financial Services - SEA region',
		shortTitle: 'Mercedes-Benz Financial Services - SEA region',
		description: 'Led the UX/UI Research & Design for Southeast Asian Countries',
		image: '/assets/projects/mb-thumbnail.avif',
		href: '/projects/mbfs-sea',
		role: 'Lead Product Designer',
		domain: 'fintech',
		size: 'md',
		orbit: 2,
		status: 'uncharted',
	},
	{
		slug: 'mbfs-au',
		title: 'MBFS / Digital Payment Solutions',
		shortTitle: 'MBFS Australia',
		description: 'Led the UX/UI research & Design for MBFS Australia',
		image: '/assets/projects/mb-thumbnail-2.avif',
		href: '/projects/mbfs-au',
		role: 'Lead Product Designer',
		domain: 'fintech',
		size: 'md',
		orbit: 3,
		status: 'charted',
	},
	{
		slug: 'semble',
		title: 'Semble',
		shortTitle: 'Semble',
		description: 'Case study will be updated soon...',
		image: '/assets/projects/background-main.jpg',
		href: '/projects/semble',
		role: 'Lead Product Designer',
		domain: 'consumer',
		size: 'sm',
		orbit: 3,
		status: 'uncharted',
	},
	{
		slug: 'gold-tracker',
		title: 'GoldTracker',
		shortTitle: 'GoldTracker',
		description: 'A free price-alert tool born from a personal gold-investing need, tracking five markets with live prices and flexible alerts.',
		image: '/assets/projects/background-main.jpg',
		href: '/projects/gold-tracker',
		role: 'Founder & Creator',
		domain: 'fintech',
		size: 'sm',
		orbit: 3,
		status: 'charted',
	},
];
