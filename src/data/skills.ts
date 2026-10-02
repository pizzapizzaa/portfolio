export const skills = [
	'Business Development & Brand Strategy',
	'Product Conceptualization',
	'Product & Team Management',
	'Client & Stakeholder Management',
	'Product Leadership & Design Operations',
	'UX Research & Strategy',
	'Product Strategy & Lifecycle Management',
	'UX/UI Design & Product Execution',
];

export const tools = [
	{ name: 'Framer', icon: '/assets/projects/framer-logo.avif' },
	{ name: 'Figma', icon: '/assets/projects/figma-logo.avif' },
	{ name: 'Illustrator', icon: '/assets/projects/illustrator-logo.avif' },
	{ name: 'Sketch', icon: '/assets/projects/sketch-logo.avif' },
	{ name: 'ClickUp', icon: '/assets/projects/click-up-logo.png' },
	{ name: 'Spline', icon: '/assets/projects/spline-logo.avif' },
	{ name: 'Blender', icon: '/assets/projects/blender-logo.avif' },
	{ name: 'Github', icon: '/assets/projects/github-logo.png' },
];

export const languages = [
	{ name: 'English', level: 100 },
	{ name: 'Vietnamese', level: 100 },
	{ name: 'Mandarin', level: 11 },
	{ name: 'Arabic', level: 11 },
];

export interface Credential {
	institution: string;
	credential: string;
	link?: string;
	year?: string;
}

export const education: Credential[] = [
	{
		institution: 'Coursera.org',
		credential: 'Google Data Analytics',
		link: 'https://coursera.org/share/3ba5d8e7478dbb2e0b009dd99909977f',
	},
	{
		institution: 'Coursera.org',
		credential: 'Data Analysis and Visualization Foundations (IBM)',
		link: 'https://coursera.org/share/d8e8565a16c3920dfcb90875b408727f',
	},
	{
		institution: 'Coursera.org',
		credential: 'Google Project Management',
		link: 'https://coursera.org/share/df300cc6d2fb1e24495314ba5cbefe42',
	},
	{ institution: 'Institute of Project Management', credential: 'Certified Associate Project Management', year: '2021' },
	{ institution: 'Orita Sinclair, Singapore', credential: 'Design Communication', year: '2018' },
	{ institution: 'Hoa Sen University, Vietnam', credential: 'Certificate in Graphic Design', year: '2017' },
];
