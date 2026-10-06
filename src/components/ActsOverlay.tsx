/**
 * ActsOverlay.tsx - Accessible DOM content for the optional 3D experience
 * 
 * Synchronized with the 3D continuous camera trajectory.
 * Ensures 100% SEO indexability, accessibility, and kinetic typography.
 */

import React, { useState } from 'react';
import {
  Github,
  Mail,
  Linkedin,
  FileText,
  Sparkles,
  Layers,
  FlaskConical,
  Box,
} from 'lucide-react';
import {
  PORTFOLIO_OWNER,
  FEATURED_PROJECT_IDS,
  PROJECTS,
  LAB_EXPERIMENTS,
  HOW_I_BUILD_STAGES,
} from '../data/portfolioData.ts';
import { soundManager } from '../audio/soundManager.ts';
import { PortraitFigure } from './PortraitFigure.tsx';
import { ProjectStory } from './ProjectStory.tsx';
import { SkillExplorer } from './SkillExplorer.tsx';

interface ActsOverlayProps {
  onOpenCaseStudy: (projectId: string) => void;
  onOpenLab: (labId: string) => void;
  onOpenAskAi: () => void;
  onToggleWireframe: () => boolean;
  scrollProgress: number;
}

export function ActsOverlay({
  onOpenCaseStudy,
  onOpenLab,
  onOpenAskAi,
  onToggleWireframe,
  scrollProgress,
}: ActsOverlayProps) {
  const [isWireframe, setIsWireframe] = useState(false);

  const handleWireframeToggle = () => {
    soundManager.playClick();
    const state = onToggleWireframe();
    setIsWireframe(state);
  };

  return (
    <div className="relative z-10 w-full pointer-events-none select-none">
      <div
        className="cinematic-scroll-progress"
        aria-hidden="true"
        style={{ transform: `scaleX(${Math.max(0, Math.min(scrollProgress, 1))})` }}
      />
      {/* ═══════════════════════════════════════════════
          HOME
          ═══════════════════════════════════════════════ */}
      <div className="hero-scene">
        <section id="home" className="hero-section min-h-screen grid grid-cols-1 lg:grid-cols-[1.12fr_0.88fr] items-center gap-4 lg:gap-8 px-6 sm:px-12 xl:px-16 max-w-7xl mx-auto pt-24 pb-10">
          <div className="hero-copy pointer-events-auto max-w-3xl">
          {/* Tag & Availability */}
          <div className="flex items-center gap-2.5 text-xs font-mono text-slate-400 mb-4 tracking-wider">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-emerald-400 font-semibold">{PORTFOLIO_OWNER.statusBadge}</span>
            <span className="text-slate-600">·</span>
            <span>{PORTFOLIO_OWNER.tag}</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-extrabold tracking-tight text-white mb-4 leading-[1.08] text-balance">
            TAFADZWA NKALA
          </h1>
          <p className="text-lg sm:text-xl font-medium text-cyan-200 mb-5">
            Software Engineer building AI-powered products
          </p>

          <p className="text-base sm:text-lg text-slate-200 mb-8 max-w-2xl leading-relaxed">
            I build AI-powered products and full-stack systems that turn complex ideas into useful software.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3">
            <a
              href="#projects"
              className="min-h-11 px-6 py-3 text-sm font-medium text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-md transition-colors cursor-pointer"
            >
              VIEW PROJECTS
            </a>

            <a
              href={PORTFOLIO_OWNER.links.resume}
              download
              className="flex items-center gap-2 min-h-11 px-5 py-3 text-sm text-slate-200 bg-slate-900/80 border border-slate-800 hover:border-slate-700 hover:text-white rounded-md transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>DOWNLOAD RESUME</span>
            </a>

          </div>
          </div>
          <PortraitFigure className="hero-portrait" enableEffect />
        </section>
      </div>

      {/* ═══════════════════════════════════════════════
          PROJECTS
          ═══════════════════════════════════════════════ */}
      <section id="projects" className="px-6 sm:px-16 max-w-6xl mx-auto py-24 flex flex-col gap-10">
        <header className="pointer-events-auto max-w-2xl story-beat">
          <p className="text-xs font-mono text-slate-300 mb-2">SELECTED WORK</p>
          <h2 className="text-3xl sm:text-5xl font-display font-bold text-white mb-4">Projects</h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Follow each project from problem to system, contribution, and repository evidence.
          </p>
        </header>
        {FEATURED_PROJECT_IDS.map((id, index) => {
          const project = PROJECTS.find((item) => item.id === id);
          return project ? (
            <ProjectStory key={project.id} project={project} index={index} onOpenCaseStudy={onOpenCaseStudy} />
          ) : null;
        })}
      </section>

      {/* ═══════════════════════════════════════════════
          ENGINEERING LAB
          ═══════════════════════════════════════════════ */}
      <section id="lab" className="min-h-screen px-6 sm:px-16 max-w-6xl mx-auto py-32 flex flex-col justify-center">
        <div className="pointer-events-auto max-w-2xl mb-12">
          <div className="flex items-center gap-2 text-xs font-mono text-purple-400 mb-2">
            <FlaskConical className="w-3.5 h-3.5" />
            <span>ENGINEERING LAB</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-display font-bold text-white mb-4">
            What I Tried. What Failed. What I Learned.
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            A closer look at experiments, trade-offs, failed approaches, and lessons learned.
          </p>
        </div>

        <div className="pointer-events-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {LAB_EXPERIMENTS.slice(0, 3).map((exp) => (
        <article key={exp.id} className="lab-card cinematic-lab-card">
          <div className="lab-card-heading">
            <FlaskConical aria-hidden="true" />
            <span>{exp.domain}</span>
          </div>
          <h3>{exp.title}</h3>
          <ol className="lab-story">
            <li><span className="lab-story-step">01 / Attempt</span><p>{exp.whatITried}</p></li>
            <li><span className="lab-story-step">02 / Failure</span><p>{exp.whatFailed}</p></li>
            <li><span className="lab-story-step">03 / What worked</span><p>{exp.whatWorked}</p></li>
            <li><span className="lab-story-step">04 / Lesson</span><p>{exp.whatILearned}</p></li>
          </ol>
          <button className="text-link" onClick={() => onOpenLab(exp.id)}>
            Full experiment
          </button>
        </article>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          SKILLS
          ═══════════════════════════════════════════════ */}
      <section id="skills" className="min-h-screen px-6 sm:px-16 max-w-6xl mx-auto py-32 flex flex-col justify-center">
        <div className="pointer-events-auto max-w-2xl mb-10">
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-2">
            <Layers className="w-3.5 h-3.5" />
            <span>SKILLS</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-display font-bold text-white mb-4">
            Skills, with proof
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Choose an area to see the skills and repositories behind it.
          </p>
        </div>
        <div className="pointer-events-auto">
          <SkillExplorer />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          HOW I BUILD
          ═══════════════════════════════════════════════ */}
      <section className="min-h-screen px-6 sm:px-16 max-w-6xl mx-auto py-32 flex flex-col justify-center">
        <div className="pointer-events-auto max-w-2xl mb-12">
          <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider block mb-2">
            PROCESS
          </span>
          <h2 className="text-3xl sm:text-5xl font-display font-bold text-white mb-4">
            How I Build
          </h2>
          <p className="text-sm text-slate-300">
            A repeatable process for understanding, building, and reviewing software.
          </p>
        </div>

        <div className="pointer-events-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {HOW_I_BUILD_STAGES.map((stage) => (
            <div
              key={stage.step}
              className="p-5 rounded-lg bg-[#070b13]/85 border border-slate-800/90 backdrop-blur-md"
            >
              <div className="text-xs font-mono text-cyan-400 mb-1">{stage.step}</div>
              <h3 className="font-display font-bold text-white text-base mb-1">{stage.name}</h3>
              <div className="text-xs text-cyan-300/90 font-medium mb-2">{stage.tagline}</div>
              <p className="text-xs text-slate-400 leading-relaxed">{stage.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          DESIGNING THE EXPERIENCE
          ═══════════════════════════════════════════════ */}
      <section className="min-h-screen px-6 sm:px-16 max-w-6xl mx-auto py-32 flex flex-col justify-center">
        <div className="pointer-events-auto max-w-2xl p-8 rounded-xl bg-[#070b13]/90 border border-cyan-500/30 backdrop-blur-md">
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-2">
            <Box className="w-3.5 h-3.5" />
            <span>DESIGN</span>
          </div>
          <h2 className="text-3xl font-display font-bold text-white mb-3">
            Idea → Plan → Build → Review
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed mb-6">
            The optional 3D scene can be shown with wireframe geometry for a different view of its shapes.
          </p>

          <button
            onClick={handleWireframeToggle}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
              isWireframe
                ? 'bg-cyan-400 text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.5)]'
                : 'bg-slate-900 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-950/40'
            }`}
          >
            <Box className="w-4 h-4" />
            <span>{isWireframe ? 'Disable wireframe view' : 'Show wireframe view'}</span>
          </button>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          ABOUT
          ═══════════════════════════════════════════════ */}
      <section id="about" className="cinematic-about min-h-screen px-6 sm:px-16 max-w-6xl mx-auto py-24 flex flex-col justify-center">
        <div className="cinematic-about-content pointer-events-auto">
          <PortraitFigure className="about-portrait" />
          <div className="cinematic-about-copy">
            <span className="text-xs font-mono text-slate-300 uppercase tracking-wider block mb-3">About</span>
            <h2 className="text-4xl sm:text-6xl font-display font-bold text-white mb-6">Who I am</h2>
            <p>{PORTFOLIO_OWNER.name} — {PORTFOLIO_OWNER.tag}.</p>
            <h3>What I build</h3>
            <p>{PORTFOLIO_OWNER.subline}</p>
            <h3>What I’m looking for</h3>
            <p>{PORTFOLIO_OWNER.lookingFor}.</p>
            <p className="cinematic-about-location">{PORTFOLIO_OWNER.location}</p>
          </div>
        </div>
        <div className="pointer-events-auto mt-8">
          <a className="inline-flex items-center gap-2 text-sm text-cyan-300 hover:text-white" href={PORTFOLIO_OWNER.links.github} target="_blank" rel="noopener noreferrer">
            <Github className="w-4 h-4" aria-hidden="true" />
            View GitHub profile
          </a>
          <button className="ml-5 inline-flex items-center gap-2 text-sm text-cyan-300 hover:text-white" onClick={onOpenAskAi}>
            <Sparkles className="w-4 h-4" aria-hidden="true" />
            Ask about my projects
          </button>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          CONTACT
          ═══════════════════════════════════════════════ */}
      <section id="contact" className="min-h-screen px-6 sm:px-16 max-w-6xl mx-auto py-32 flex flex-col justify-center items-center text-center">
        <div className="pointer-events-auto max-w-xl p-8 rounded-xl bg-[#070b13]/90 border border-cyan-500/30 backdrop-blur-md shadow-2xl">
          <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider block mb-2">
            CONTACT
          </span>
          <h2 className="text-4xl sm:text-5xl font-display font-extrabold text-white mb-4">
            Let's build.
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed mb-8">
            Whether you have an ambitious AI problem, a high-throughput systems challenge, or an open
            engineering role, I want to talk.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
            <a
              href={`mailto:${PORTFOLIO_OWNER.email}`}
              className="w-full sm:w-auto px-6 py-3 text-xs font-mono font-medium text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded transition-colors"
            >
              {PORTFOLIO_OWNER.email}
            </a>
            <a
              href={PORTFOLIO_OWNER.links.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-3 text-xs font-mono text-slate-200 bg-slate-900 border border-slate-700 hover:text-white rounded transition-colors"
            >
              LINKEDIN
            </a>
            <a
              href={PORTFOLIO_OWNER.links.github}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-3 text-xs font-mono text-slate-200 bg-slate-900 border border-slate-700 hover:text-white rounded transition-colors"
            >
              GITHUB
            </a>
          </div>

          {/* Self-referential Module Note */}
          <div className="pt-6 border-t border-slate-800/80 text-xs text-slate-400">
            <span>This portfolio is also an engineering project.</span>{' '}
            <button
              onClick={() => onOpenCaseStudy('portfolio-os')}
              className="text-cyan-400 hover:underline cursor-pointer ml-1"
            >
              Inspect Architecture & Source →
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
