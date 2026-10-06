import React, { useEffect, useState } from 'react';
import { Volume2, VolumeX, Command, Sparkles, Briefcase, Menu, X, FileText } from 'lucide-react';
import { soundManager } from '../audio/soundManager.ts';
import { PORTFOLIO_OWNER } from '../data/portfolioData.ts';

interface TopNavigationProps {
  recruiterMode: boolean;
  onToggleRecruiterMode: () => void;
  onOpenCommandPalette: () => void;
  onOpenAskAi: () => void;
  onNavigateToProgress: (progress: number) => void;
}

const navigationItems = [
  { label: 'Home', progress: 0, section: 'home' },
  { label: 'Projects', progress: 0.12, section: 'projects' },
  { label: 'Lab', progress: 0.48, section: 'lab' },
  { label: 'Skills', progress: 0.68, section: 'skills' },
  { label: 'About', progress: 0.85, section: 'about' },
  { label: 'Contact', progress: 0.98, section: 'contact' },
];

export function TopNavigation({
  recruiterMode,
  onToggleRecruiterMode,
  onOpenCommandPalette,
  onOpenAskAi,
  onNavigateToProgress,
}: TopNavigationProps) {
  const [isMuted, setIsMuted] = useState(soundManager.isMuted());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const targets = navigationItems
      .map((item) => document.getElementById(item.section))
      .filter((target): target is HTMLElement => target !== null);
    if (!('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver((entries) => {
      const visibleSections = entries
        .filter((entry) => entry.isIntersecting)
        .sort((left, right) => right.intersectionRatio - left.intersectionRatio);
      if (visibleSections[0]) setActiveSection(visibleSections[0].target.id);
    }, { rootMargin: '-18% 0px -62% 0px', threshold: [0, 0.15, 0.4] });

    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, [recruiterMode]);

  const navigate = (progress: number, section: string) => {
    setMobileMenuOpen(false);
    const target = document.getElementById(section);
    if (target) {
      target.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      });
      return;
    }
    if (!recruiterMode) onNavigateToProgress(progress);
  };

  const handleToggleSound = () => {
    setIsMuted(soundManager.toggleMute());
  };

  return (
    <header className="portfolio-navigation fixed inset-x-0 top-0 z-40 flex items-center justify-between gap-3 px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-800/80 bg-[#030712]/95 backdrop-blur-md">
      <a
        href="#home"
        onClick={(event) => {
          event.preventDefault();
          navigate(0, 'home');
        }}
        className="shrink-0 text-xs sm:text-sm font-display font-semibold tracking-wide sm:tracking-wider text-slate-100 hover:text-cyan-400 transition-colors uppercase"
      >
        {PORTFOLIO_OWNER.name}
      </a>

      <nav aria-label="Main navigation" className="hidden md:flex items-center gap-3 lg:gap-6 text-xs font-mono uppercase tracking-wider text-slate-300">
        {navigationItems.map((item) => (
          <button
            key={item.label}
            onClick={() => navigate(item.progress, item.section)}
            className={`nav-section-link hover:text-white transition-colors cursor-pointer py-2${activeSection === item.section ? ' is-active' : ''}`}
            aria-current={activeSection === item.section ? 'location' : undefined}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        <a
          href={PORTFOLIO_OWNER.links.resume}
          download
          className="hidden md:flex items-center gap-1.5 min-h-9 px-2.5 text-xs font-medium text-slate-200 hover:text-white transition-colors"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Resume</span>
        </a>

        <button
          onClick={onOpenAskAi}
          className="nav-ask-agent hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-md transition-colors cursor-pointer"
          title="Ask a question answered from the portfolio's project data"
        >
          <Sparkles className="nav-ask-agent-icon w-3.5 h-3.5" />
          <span>Ask Portfolio</span>
        </button>

        {!recruiterMode && (
          <>
            <button
              onClick={onOpenCommandPalette}
              className="hidden lg:flex items-center gap-1 px-2.5 py-2 text-xs font-mono text-slate-300 bg-slate-900/90 border border-slate-800 rounded-md hover:border-slate-700 hover:text-white transition-colors cursor-pointer"
              title="Open Command Palette (Cmd+K)"
            >
              <Command className="w-3 h-3 text-slate-400" />
              <span className="text-[11px] text-slate-400">⌘K</span>
            </button>
            <button
              onClick={handleToggleSound}
              className={`hidden lg:block p-2 rounded-md border text-xs transition-colors cursor-pointer ${
                isMuted
                  ? 'text-slate-500 border-slate-800 hover:text-slate-300'
                  : 'text-cyan-400 border-cyan-500/40 bg-cyan-950/30'
              }`}
              title={isMuted ? 'Sound: OFF (Click to unmute)' : 'Sound: ON (Click to mute)'}
              aria-label="Toggle audio synthesizer"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </>
        )}

        <button
          onClick={() => {
            setMobileMenuOpen(false);
            onToggleRecruiterMode();
          }}
          className="flex items-center justify-center gap-1.5 min-h-9 px-2 sm:px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer bg-slate-900 border border-slate-700 text-slate-200 hover:border-slate-500 hover:text-white"
          title={recruiterMode ? 'Explore the optional 3D portfolio' : 'Return to the clean portfolio view'}
          aria-label={recruiterMode ? 'Explore 3D view' : 'Return to standard portfolio view'}
          aria-pressed={!recruiterMode}
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span className="hidden sm:inline whitespace-nowrap">{recruiterMode ? '3D View' : 'Standard View'}</span>
        </button>

        <button
          type="button"
          className="md:hidden flex items-center justify-center w-9 h-9 rounded-md border border-slate-700 text-slate-200 hover:text-white hover:border-slate-500"
          aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMobileMenuOpen((open) => !open)}
        >
          {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      {mobileMenuOpen && (
        <nav
          id="mobile-navigation"
          aria-label="Mobile navigation"
          className="absolute top-full left-0 right-0 md:hidden border-b border-slate-800 bg-[#030712] p-3 shadow-xl"
        >
          {navigationItems.map((item) => (
            <button
              key={item.label}
              onClick={() => navigate(item.progress, item.section)}
              className={`mobile-nav-link block w-full rounded px-3 py-3 text-left text-sm font-mono text-slate-200 hover:bg-slate-900 hover:text-white${activeSection === item.section ? ' is-active' : ''}`}
              aria-current={activeSection === item.section ? 'location' : undefined}
            >
              {item.label}
            </button>
          ))}
          <a
            href={PORTFOLIO_OWNER.links.resume}
            download
            onClick={() => setMobileMenuOpen(false)}
            className="flex w-full items-center gap-2 rounded px-3 py-3 text-sm text-slate-200 hover:bg-slate-900"
          >
            <FileText className="w-4 h-4" />
            Download Resume
          </a>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenAskAi();
            }}
            className="mt-2 flex w-full items-center gap-2 rounded border-t border-slate-800 px-3 py-3 text-left text-sm text-cyan-300"
          >
            <Sparkles className="w-4 h-4" />
            Ask Portfolio
          </button>
        </nav>
      )}
    </header>
  );
}
