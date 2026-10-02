export interface Job {
	title: string;
	company: string;
	period: string;
	description: string;
	responsibilities: string[];
	projectLink?: string;
	projectLinks?: string[];
}

export const workExperience: Job[] = [
	{
		title: 'Product Manager',
		company: 'Verity Nature (a.k.a Blue Carbon S2C), Singapore',
		period: 'Aug 2023 - Present',
		description: 'As Product Manager at Verity Nature, I conceptualized and built software roadmap to translate physical nature-based conservation and restoration data into verifiable digital frameworks. My role involved leading specialized research and design workshops to facilitate innovation in MRV technology, ensuring that high-fidelity design mockups and interactive prototypes were technically aligned with complex environmental data requirements.',
		responsibilities: [
			'Working closely with Lead Developer, CTO, CEO, Co-founders to build strategy, roadmap & planning for multiple products which catered to various regions.',
			'Jointly managing product design and development teams to ensure product roadmap and development are in alignment with business objectives.',
			'Planning product development schedules and timelines to maintain a timely and efficient release pipeline.',
			'Conceptualizing products from ideation to low-fi UI design to mid/hi-fi UI design together with designers, lead developer & CTO.',
			'Supporting design team with UXUI design, marketing collateral design, corporate material design as needed.',
			'Leading a fun and healthy team culture by hosting engaging virtual team-bonding events.'
		],
		projectLinks: ['/projects/verity-nature-mrv', '/projects/verity-east-africa']
	},
	{
		title: 'Founder & Business Development Head',
		company: 'Boulder Box Saigon, Vietnam',
		period: 'Aug 2023 - Present',
		description: 'As Founder & Business Development Head at Boulder Box Saigon, I led the creation of a niche boutique bouldering gym concept tailored to the Vietnamese sports market. From market research and wall construction to brand development and team building, I oversaw every aspect of the business with a clear vision for quality, community, and growth. Under my leadership, Boulder Box achieved a 250% increase in sales in its 2nd year, launched a PT program with a 100% client return rate, and hosted multiple successful community events.',
		responsibilities: [
			'Conducted comprehensive analysis of the Vietnamese sports market to identify opportunities and establish a niche for home bouldering gym.',
			'Developed a compelling brand strategy to position Boulder Box Saigon as a leader in the local climbing community.',
			'Led talent acquisition efforts to build a team of skilled professionals dedicated to delivering exceptional experiences for climbing enthusiasts. Boulder Box\'s PT program has a 100% returning rate.',
			'Strategized, planned, and executed targeted marketing campaigns to raise brand awareness and engage the climbing community. Over 3 successful events with a total of 100+ customers attended in the past year.',
			'Passionately built Boulder Box Saigon as a testament to personal vision and a love for climbing, creating a space that bridges sport, lifestyle, and community.'
		],
		projectLink: '/projects/boulder-box-saigon'
	},
	{
		title: 'Head of Digital Product Research & Design',
		company: 'Mission+, Singapore',
		period: '2021 - 2022',
		description: 'As Head of Digital Product Research & Design at Mission+, I led product strategy, research, and design execution across multiple client engagements.',
		responsibilities: [
			'Established and implemented comprehensive Research & Design roadmaps for both internal development initiatives and client engagement projects.',
			'Aligned the roadmap with organizational objectives, client needs, and emerging market trends to ensure innovative and impactful outcomes.',
			'Initiated usability testing, user interviews, and hypothesis validation processes to uncover actionable insights and enhance user satisfaction.',
			'Developed and refined product prototypes to validate ideas quickly and efficiently, fostering an iterative design approach.',
			'Bridged the gap between users, customers, business owners, stakeholders, and technical teams by facilitating a unified understanding of goals, challenges, and solutions.',
			'Led the conceptualization of new product ideas through rapid design prototyping methods, enabling swift iteration and alignment with user expectations.',
			'Utilised statistical research, data analysis, and productivity metrics to provide clear, evidence-based insights that drive informed decision-making.'
		]
	},
	{
		title: 'Lead UX/UI Design',
		company: 'Mercedes-Benz Mobility AG, Germany / Mercedes-Benz Financial Services, Singapore',
		period: '2019 - 2023',
		description: 'As Lead UX/UI Designer at Mercedes-Benz Mobility, I co-led research and design efforts across the aftersales customer journey for markets including AAP, Australia, New Zealand, and Europe. I directed end to end product design, from user research and hypothesis validation to prototyping, testing, and production, ensuring solutions were both user-centered and business-focused.',
		responsibilities: [
			'Co-led research and design initiatives for the Mercedes-Benz Financial Services aftersales customer journey, focusing on AAP, AU, NZ, and European markets.',
			'Strategized, planned, and executed user interviews and studies to gather actionable insights and validate product hypotheses.',
			'Analyzed UX research data to develop customer-driven product design roadmaps, ensuring alignment with business goals and user needs.',
			'Managed the end-to-end design roadmap for the markets I was in charged of, overseeing the product lifecycle from concept creation to design, usability testing, development readiness, and production stages.',
			'Collaborated effectively with stakeholders, including designers, product owners, developers, and chief product owners, to ensure seamless execution of projects.',
			'Established and advocated design philosophies and best practices within cross-functional teams, fostering a culture of design excellence.',
			'Delivered high-quality design mockups and interactive prototypes for a range of products, ensuring alignment with user requirements and brand standards.',
			'Organized and facilitated research and design workshops to drive collaboration and innovation within internal teams.'
		],
		projectLinks: ['/projects/mbfs-sea', '/projects/mbfs-au']
	}
];
