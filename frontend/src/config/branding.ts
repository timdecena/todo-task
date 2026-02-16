/**
 * Central brand and landing constants.
 * Keep branding values here so color/content updates are made in one place.
 */
export const BRANDING = {
  appName: 'Sug Done',
  primaryColor: '#D1232A',
  heroHeadline: 'Smart task management that keeps work simple and on time.',
  heroSubtitle:
    'Plan tasks, track deadlines, and move faster with clear views built for everyday teams.',
  oneLineDescription:
    'A simple app to organize tasks, manage deadlines, and finish work without stress.',
  contactEmail: 'hello@sugdone.app',
};

export const LANDING_SECTION_IDS = {
  features: 'features',
  demo: 'demo',
  techStack: 'tech-stack',
  contact: 'contact',
} as const;

export type LandingSectionId = (typeof LANDING_SECTION_IDS)[keyof typeof LANDING_SECTION_IDS];

export const NAV_LINKS: Array<{ label: string; sectionId: LandingSectionId }> = [
  { label: 'Features', sectionId: LANDING_SECTION_IDS.features },
  { label: 'Demo', sectionId: LANDING_SECTION_IDS.demo },
  { label: 'Tech Stack', sectionId: LANDING_SECTION_IDS.techStack },
  { label: 'Contact', sectionId: LANDING_SECTION_IDS.contact },
];

export const SOCIAL_PROOF_ITEMS = ['Alliance Labs', 'SprintOps', 'Northstar Team', 'Vertex Studio', 'FlowCloud'];

export const TECH_STACK_ITEMS = [
  'Spring Boot 17',
  'TypeScript',
  'Vite',
  'MySQL Workbench',
  'Ant Design',
];

