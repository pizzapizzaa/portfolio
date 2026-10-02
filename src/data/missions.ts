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
		title: 'Verity Nature East Africa',
		shortTitle: 'Verity East Africa',
		description: 'Nature-based solutions to nature restoration and preservation in East Africa.',
		image: '/assets/projects/verity-01.avif',
		href: '/projects/verity-east-africa',
		role: 'Lead Product Designer',
		domain: 'climate',
		size: 'md',
		orbit: 1,
		status: 'uncharted',
	},
	{
		slug: 'mbfs-sea',
		title: 'MBFS / After-sale Digital Solution SEA - Part 1',
		shortTitle: 'MBFS SEA',
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
		status: 'uncharted',
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
		description: 'Case study will be updated soon...',
		image: '/assets/projects/background-main.jpg',
		href: '/projects/gold-tracker',
		role: 'Lead Product Designer',
		domain: 'fintech',
		size: 'sm',
		orbit: 3,
		status: 'uncharted',
	},
];
