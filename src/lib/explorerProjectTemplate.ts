export const EXPLORER_PROJECT_STYLE_TEMPLATE = 'explorer_project';

export interface ExplorerProjectSectionConfig {
  rootSelector: string;
  trackedSelectors: Record<string, string>;
}

export interface ExplorerProjectStyleTemplate {
  templateId: string;
  projectSlug: string;
  sections: {
    topHud: ExplorerProjectSectionConfig;
    bottomQuiz: ExplorerProjectSectionConfig;
  };
}

export const DEFAULT_EXPLORER_PROJECT_SELECTORS: ExplorerProjectStyleTemplate['sections'] = {
  topHud: {
    rootSelector: '#bbo-explorer-hud',
    trackedSelectors: {
      hudInner: '.bbo-hud-inner',
      leftColumn: '.bbo-hud-left',
      exitButton: '#bboExitBtn',
      explorerIdentity: '.bbo-hud-explorer-id',
      nickname: '#bboHudNick',
      centerColumn: '.bbo-hud-center',
      rankBadge: '#bboHudRank',
      expWrap: '.bbo-hud-exp-wrap',
      expBar: '.bbo-hud-exp-bar',
      expFill: '#bboHudExpFill',
      expText: '#bboHudExpText',
      rightColumn: '.bbo-hud-right',
      progress: '#bboHudProgress',
      settingsButton: '#bboSettingsBtn',
    },
  },
  bottomQuiz: {
    rootSelector: '#bbo-quiz-dock',
    trackedSelectors: {
      dockTab: '#bboDockTab',
      dockStatus: '#bboDockStatus',
      dockBody: '.bbo-dock-body',
      dots: '#bboQuizDots',
      card: '#bboQuizCard',
      number: '#bboQuizNum',
      title: '#bboQuizTitle',
      exp: '#bboQuizExp',
      prompt: '#bboQuizPrompt',
      options: '#bboQuizOptions',
      hintButton: '#bboHintBtn',
      hintText: '#bboHintText',
      prevButton: '#bboPrev',
      nextButton: '#bboNext',
      doneBanner: '#bboQuizDone',
      doneSummary: '#bboDoneSub',
      shareBanner: '#bboShareBanner',
    },
  },
};

export function createDefaultExplorerProjectTemplateConfig(projectSlug: string): ExplorerProjectStyleTemplate {
  return {
    templateId: EXPLORER_PROJECT_STYLE_TEMPLATE,
    projectSlug,
    sections: DEFAULT_EXPLORER_PROJECT_SELECTORS,
  };
}

export interface TrackedElement {
  selector: string;
  found: boolean;
  id: string | null;
  tagName: string | null;
}

export interface ExplorerProjectTemplateSnapshot {
  templateId: string;
  projectSlug: string;
  missingSelectors: string[];
  tracked: {
    topHud: Record<string, TrackedElement>;
    bottomQuiz: Record<string, TrackedElement>;
  };
}

export interface RegisteredExplorerProjectTemplate {
  config: ExplorerProjectStyleTemplate;
  snapshot: ExplorerProjectTemplateSnapshot;
  registeredAt: string;
}

declare global {
  interface Window {
    __explorerProjectTemplates?: Record<string, RegisteredExplorerProjectTemplate>;
    __explorerProjectTemplateSnapshots?: Record<string, ExplorerProjectTemplateSnapshot>;
  }
}

function resolveTrackedSelectors(
  trackedSelectors: Record<string, string>,
  root: ParentNode,
  sectionName: 'topHud' | 'bottomQuiz',
  missingSelectors: string[]
): Record<string, TrackedElement> {
  const tracked: Record<string, TrackedElement> = {};

  Object.entries(trackedSelectors).forEach(([key, selector]) => {
    const el = root.querySelector(selector);
    if (!el) {
      missingSelectors.push(`${sectionName}.${key}:${selector}`);
    }
    tracked[key] = {
      selector,
      found: Boolean(el),
      id: el?.id ?? null,
      tagName: el?.tagName ?? null,
    };
  });

  return tracked;
}

export function registerExplorerProjectTemplate(
  config: ExplorerProjectStyleTemplate,
  root: Document = document
): ExplorerProjectTemplateSnapshot {
  const missingSelectors: string[] = [];

  const topHudRoot = root.querySelector(config.sections.topHud.rootSelector);
  if (!topHudRoot) {
    missingSelectors.push(`topHud.root:${config.sections.topHud.rootSelector}`);
  }

  const bottomQuizRoot = root.querySelector(config.sections.bottomQuiz.rootSelector);
  if (!bottomQuizRoot) {
    missingSelectors.push(`bottomQuiz.root:${config.sections.bottomQuiz.rootSelector}`);
  }

  const snapshot: ExplorerProjectTemplateSnapshot = {
    templateId: config.templateId,
    projectSlug: config.projectSlug,
    missingSelectors,
    tracked: {
      topHud: resolveTrackedSelectors(
        config.sections.topHud.trackedSelectors,
        topHudRoot ?? root,
        'topHud',
        missingSelectors
      ),
      bottomQuiz: resolveTrackedSelectors(
        config.sections.bottomQuiz.trackedSelectors,
        bottomQuizRoot ?? root,
        'bottomQuiz',
        missingSelectors
      ),
    },
  };

  if (typeof window !== 'undefined') {
    if (!window.__explorerProjectTemplates) {
      window.__explorerProjectTemplates = {};
    }
    if (!window.__explorerProjectTemplateSnapshots) {
      window.__explorerProjectTemplateSnapshots = {};
    }

    const registered: RegisteredExplorerProjectTemplate = {
      config,
      snapshot,
      registeredAt: new Date().toISOString(),
    };

    window.__explorerProjectTemplates[config.projectSlug] = registered;
    window.__explorerProjectTemplateSnapshots[config.projectSlug] = snapshot;

    window.dispatchEvent(
      new CustomEvent('explorer-project-template-registered', {
        detail: {
          projectSlug: config.projectSlug,
          templateId: config.templateId,
          missingCount: missingSelectors.length,
          tracked: snapshot.tracked,
        },
      })
    );
  }

  return snapshot;
}
