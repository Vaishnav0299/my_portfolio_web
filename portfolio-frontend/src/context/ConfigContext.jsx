import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../lib/api.js';

export const defaultSubcomponents = {
  heroBadge: true,
  heroTypewriter: true,
  heroCta: true,
  heroMarquee: true,
  githubStats: true,
  githubLanguages: true,
  aboutBioCard: true,
  aboutPhilosophyCard: true,
  timelineFilters: true,
  timelineAchievements: true,
  timelineStackTags: true,
  projectsFilters: true,
  projectsMetrics: true,
  projectsStack: true,
  projectsLinks: true,
  servicesBullets: true,
  servicesCta: true,
  skillsPercentageBars: true,
  skillsCategoryIcons: true,
  processPhases: true,
  blogMetadata: true,
  testimonialsMarquee: true,
  testimonialsStars: true,
  testimonialsAvatars: true,
  faqCategoryPills: true,
  contactDirectInfo: true,
  contactForm: true,
};

const defaultConfig = {
  components: {
    hero: true,
    githubStrip: true,
    about: true,
    experience: true,
    projects: true,
    services: true,
    skills: true,
    process: true,
    blog: true,
    testimonials: true,
    now: true,
    uses: true,
    faq: true,
    contact: true,
  },
  subcomponents: defaultSubcomponents,
  effects: {
    cursorSpotlight: true,
    scrollProgress: true,
    marquee: true,
    backgroundGrid: true,
  },
  theme: {
    accentColor: 'violet',
    defaultTheme: 'dark',
    openToWorkText: 'Open to Work · Full-Time & Contracts',
    openToWorkStatus: true,
  },
};

export function isEnabled(config, componentKey, subcomponentKey) {
  if (!config) return true;
  if (componentKey && config.components?.[componentKey] === false) {
    return false;
  }
  if (subcomponentKey) {
    if (config.subcomponents?.[subcomponentKey] === false) return false;
    if (config.components?.[subcomponentKey] === false) return false;
  }
  return true;
}

const ConfigContext = createContext({
  config: defaultConfig,
  loading: true,
  error: null,
  refreshConfig: async () => {},
  updateConfigLocally: () => {},
});

export function ConfigProvider({ children }) {
  const [config, setConfig] = useState(defaultConfig);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshConfig = async () => {
    try {
      const res = await api.getConfig();
      if (res && res.data) {
        setConfig((prev) => ({
          ...defaultConfig,
          ...res.data,
          components: { ...defaultConfig.components, ...(res.data.components || {}) },
          subcomponents: { ...defaultConfig.subcomponents, ...(res.data.subcomponents || {}), ...(res.data.components || {}) },
          effects: { ...defaultConfig.effects, ...(res.data.effects || {}) },
          theme: { ...defaultConfig.theme, ...(res.data.theme || {}) },
        }));
      }
    } catch (err) {
      console.warn('[ConfigContext] Could not fetch remote config, using defaults:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshConfig();
  }, []);

  const updateConfigLocally = (partial) => {
    setConfig((prev) => ({
      ...prev,
      ...partial,
      components: { ...prev.components, ...(partial.components || {}) },
      subcomponents: { ...prev.subcomponents, ...(partial.subcomponents || {}) },
      effects: { ...prev.effects, ...(partial.effects || {}) },
      theme: { ...prev.theme, ...(partial.theme || {}) },
    }));
  };

  return (
    <ConfigContext.Provider value={{ config, loading, error, refreshConfig, updateConfigLocally }}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  return useContext(ConfigContext);
}
