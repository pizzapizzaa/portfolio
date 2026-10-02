// Section anchors for the space redesign. Order = chapter number (01–06).
export const navItems = [
	{ id: 'launch-pad', name: 'Launch Pad' },
	{ id: 'brief', name: 'Brief' },
	{ id: 'mission-log', name: 'Mission Log' },
	{ id: 'skills', name: 'Skills' },
	{ id: 'missions', name: 'Missions' },
	{ id: 'comms', name: 'Comms' },
] as const;

export type SectionId = (typeof navItems)[number]['id'];
