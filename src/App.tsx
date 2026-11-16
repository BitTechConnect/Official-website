import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ThemeProvider } from './context/ThemeContext';
import { CyberNatureCanvas } from './components/CyberNatureCanvas';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { LoadingBootOverlay } from './components/LoadingBootOverlay';
import { HomeSection } from './sections/HomeSection';
import { AboutSection } from './sections/AboutSection';
import { EventsSection } from './sections/EventsSection';
import { HackathonsSection } from './sections/HackathonsSection';
import { OpportunitiesSection } from './sections/OpportunitiesSection';
import { ProjectsSection } from './sections/ProjectsSection';
import { ResourcesSection } from './sections/ResourcesSection';
import { BlogsSection } from './sections/BlogsSection';
import { CommunitySection } from './sections/CommunitySection';
import { TeamSection } from './sections/TeamSection';
import { ContactSection } from './sections/ContactSection';
import { AdminPage } from './pages/AdminPage';
import { publicApi } from './lib/api';
import { BRAND_ASSETS } from './lib/assets';
import type { OverviewResponse, SectionId } from './types/content';

const PATH_TO_SECTION: Record<string, SectionId> = {
  '/': 'home',
  '/about': 'about',
  '/events': 'events',
  '/hackathons': 'hackathons',
  '/opportunities': 'opportunities',
  '/projects': 'projects',
  '/resources': 'resources',
  '/blogs': 'blogs',
  '/community': 'community',
  '/team': 'team',
  '/contact': 'contact',
};

const SECTION_TO_PATH: Record<SectionId, string> = {
  home: '/',
  about: '/about',
  events: '/events',
  hackathons: '/hackathons',
  opportunities: '/opportunities',
  projects: '/projects',
  resources: '/resources',
  blogs: '/blogs',
  community: '/community',
  team: '/team',
  contact: '/contact',
};

function getInitialRoute(): { isAdmin: boolean; section: SectionId } {
  if (typeof window === 'undefined') return { isAdmin: false, section: 'home' };
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  if (path === '/admin') return { isAdmin: true, section: 'home' };
  return { isAdmin: false, section: PATH_TO_SECTION[path] || 'home' };
}

function AppShell() {
  const initial = getInitialRoute();
  const [isAdminRoute, setIsAdminRoute] = useState(initial.isAdmin);
  const [activeSection, setActiveSection] = useState<SectionId>(initial.section);
  const [searchOpen, setSearchOpen] = useState(false);
  const [overview, setOverview] = useState<OverviewResponse | null>(null);
  const [overviewLoading, setOverviewLoading] = useState(true);
  const [zen3D, setZen3D] = useState(false);

  useEffect(() => {
    const onPopState = () => {
      const next = getInitialRoute();
      setIsAdminRoute(next.isAdmin);
      setActiveSection(next.section);
      setZen3D(false);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    if (isAdminRoute) return;
    setOverviewLoading(true);
    publicApi
      .getOverview()
      .then((data) => setOverview(data))
      .catch(() => setOverview(null))
      .finally(() => setOverviewLoading(false));
  }, [isAdminRoute]);

  const handleNavigate = (section: SectionId) => {
    setIsAdminRoute(false);
    setActiveSection(section);
    setZen3D(false);
    const nextPath = SECTION_TO_PATH[section] || '/';
    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, '', nextPath);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isAdminRoute) {
    return <AdminPage onExitToSite={() => handleNavigate('home')} />;
  }

  return (
    <div className="relative min-h-screen flex flex-col text-slate-900 dark:text-slate-100">
      <LoadingBootOverlay />
      <CyberNatureCanvas />

      {/* Hero Aurora Botanical Backdrop positioned at -z-[18] (BEHIND -z-10 3D WebGL Canvas) */}
      {activeSection === 'home' && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-[95vh] -z-[18] overflow-hidden bg-[#030714]"
        >
          <img
            src={BRAND_ASSETS.auroraBotanical}
            alt=""
            className={`h-full w-full object-cover transition-opacity duration-500 ${
              zen3D ? 'opacity-35' : 'opacity-75'
            }`}
          />
          <div
            className={`absolute inset-0 bg-gradient-to-r from-[#020614]/82 via-[#04142b]/45 to-[#061f24]/20 transition-opacity duration-500 ${
              zen3D ? 'opacity-45' : 'opacity-100'
            }`}
          />
          <div className="cyber-grid-bg absolute inset-0 opacity-50" />
          <div className="absolute inset-x-0 bottom-0 h-[3px] bg-gradient-to-r from-[#16A34A] via-[#06B6D4] via-[#2563EB] to-[#8B5CF6]" />
        </div>
      )}

      {/* Subtle Dark Mode Scanlines */}
      <div aria-hidden="true" className="fixed inset-0 -z-[5] hidden dark:block cyber-scanlines" />

      <Navbar
        activeSection={activeSection}
        onNavigate={handleNavigate}
        onOpenSearch={() => setSearchOpen(true)}
      />

      <main className="relative z-10 flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
            {activeSection === 'home' && (
              <HomeSection
                overview={overview}
                loading={overviewLoading}
                onNavigate={handleNavigate}
                zen3D={zen3D}
                onToggleZen3D={() => setZen3D((v) => !v)}
              />
            )}
            {activeSection === 'about' && <AboutSection siteContent={overview?.siteContent} />}
            {activeSection === 'events' && <EventsSection onNavigate={handleNavigate} />}
            {activeSection === 'hackathons' && <HackathonsSection />}
            {activeSection === 'opportunities' && <OpportunitiesSection />}
            {activeSection === 'projects' && <ProjectsSection onNavigate={handleNavigate} />}
            {activeSection === 'resources' && <ResourcesSection />}
            {activeSection === 'blogs' && <BlogsSection onNavigate={handleNavigate} />}
            {activeSection === 'community' && <CommunitySection />}
            {activeSection === 'team' && <TeamSection />}
            {activeSection === 'contact' && <ContactSection siteContent={overview?.siteContent} />}
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer onNavigate={handleNavigate} siteContent={overview?.siteContent} />

      <GlobalSearchModal
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onNavigate={handleNavigate}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppShell />
    </ThemeProvider>
  );
}
