import { useEffect, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import {
  Mail,
  Linkedin,
  Github,
  FileText,
  ArrowUpRight,
  FlaskConical,
  MapPin,
  Sparkles,
} from 'lucide-react';
import {
  HOW_I_BUILD_STAGES,
  FEATURED_PROJECT_IDS,
  LAB_EXPERIMENTS,
  PORTFOLIO_OWNER,
  PROJECTS,
} from '../data/portfolioData.ts';
import { PortraitFigure } from './PortraitFigure.tsx';
import { ProjectStory } from './ProjectStory.tsx';
interface RecruiterModeProps {
  onOpenCaseStudy: (projectId: string) => void;
  onOpenAskAi: () => void;
  onExitRecruiterMode: () => void;
  onOpenLab: (labId: string) => void;
}

import { SkillExplorer } from './SkillExplorer.tsx';

export function RecruiterMode({
  onOpenCaseStudy,
  onOpenAskAi,
  onExitRecruiterMode,
  onOpenLab,
}: RecruiterModeProps) {
  const [cinematicMotion, setCinematicMotion] = useState(false);
  const progressRef = useRef<HTMLSpanElement>(null);
  const featuredProjects = FEATURED_PROJECT_IDS
    .map((id) => PROJECTS.find((project) => project.id === id))
    .filter((project): project is (typeof PROJECTS)[number] => project !== undefined);
  const additionalProjects = ['campusconnect', 'kistos-pig-farm']
    .map((id) => PROJECTS.find((project) => project.id === id))
    .filter((project): project is (typeof PROJECTS)[number] => project !== undefined);

  useEffect(() => {
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (motionPreference.matches) return;

    setCinematicMotion(true);
    const revealElements = document.querySelectorAll<HTMLElement>('[data-reveal]');
    if (!('IntersectionObserver' in window)) {
      revealElements.forEach((element) => element.classList.add('is-visible'));
      return;
    }

    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

    revealElements.forEach((element) => revealObserver.observe(element));

    let frame = 0;
    const updateProgress = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;
        progressRef.current?.style.setProperty('transform', `scaleX(${progress})`);
      });
    };
    updateProgress();
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);

    return () => {
      revealObserver.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', updateProgress);
      window.removeEventListener('resize', updateProgress);
    };
  }, []);

  const handlePortraitPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse') return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    event.currentTarget.style.setProperty('--portrait-tilt-x', `${-y * 3}deg`);
    event.currentTarget.style.setProperty('--portrait-tilt-y', `${x * 4}deg`);
  };

  const resetPortraitPointer = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.currentTarget.style.setProperty('--portrait-tilt-x', '0deg');
    event.currentTarget.style.setProperty('--portrait-tilt-y', '0deg');
  };

  return (
    <main className="portfolio-page" data-cinematic-motion={cinematicMotion}>
      <div className="portfolio-scroll-progress" aria-hidden="true">
        <span ref={progressRef} />
      </div>
      <div className="portfolio-shell">
        <div className="hero-scene">
          <section id="home" className="portfolio-hero scroll-mt-24">
            <div className="portfolio-hero-copy" data-reveal>
              <p className="portfolio-eyebrow" data-reveal>
                <span className="availability-indicator" aria-hidden="true" />
                {PORTFOLIO_OWNER.statusBadge}
                <span className="eyebrow-divider" aria-hidden="true">/</span>
                Software Engineering · AI · Product Development
              </p>
              <h1 data-reveal>
                <span>TAFADZWA</span>
                <span>NKALA</span>
              </h1>
              <p className="portfolio-role" data-reveal>Software Engineer building AI-powered products</p>
              <p className="portfolio-value" data-reveal>
                I build AI-powered products and full-stack systems that turn complex ideas into useful software.
              </p>
              <div className="portfolio-hero-actions" data-reveal>
                <a className="portfolio-button portfolio-button-primary" href="#projects">
                  View Projects
                  <ArrowUpRight aria-hidden="true" />
                </a>
                <a className="portfolio-button portfolio-button-secondary" href={PORTFOLIO_OWNER.links.resume} download>
                  <FileText aria-hidden="true" />
                  Download Resume
                </a>
              </div>
              <div className="portfolio-hero-meta" data-reveal>
                <span><MapPin aria-hidden="true" />{PORTFOLIO_OWNER.location}</span>
                <a href={`mailto:${PORTFOLIO_OWNER.email}`}>Contact me</a>
              </div>
              <button className="portfolio-assistant-link" onClick={onOpenAskAi} data-reveal>
                <Sparkles aria-hidden="true" />
                Ask about my projects
              </button>
            </div>
            <div
              className="portfolio-portrait-wrap"
              onPointerMove={handlePortraitPointerMove}
              onPointerLeave={resetPortraitPointer}
              data-reveal
            >
              <PortraitFigure className="portfolio-portrait" enableEffect />
            </div>
            <div className="hero-specialties" aria-label="AI products, full-stack systems, and cloud tools">
              <span>AI PRODUCTS</span>
              <span aria-hidden="true">/</span>
              <span>FULL-STACK SYSTEMS</span>
              <span aria-hidden="true">/</span>
              <span>CLOUD TOOLS</span>
            </div>
            <a className="hero-scroll-cue" href="#projects">Scroll to selected work</a>
          </section>
        </div>

        <section id="projects" className="portfolio-section projects-section scroll-mt-24">
          <div className="section-heading" data-reveal>
            <p className="section-kicker">Selected work</p>
            <h2>Projects</h2>
            <p>Explore the live builds. Open a case study for the engineering details.</p>
          </div>

          <div className="featured-projects">
            {featuredProjects.map((project, index) => (
              <ProjectStory key={project.id} project={project} index={index} onOpenCaseStudy={onOpenCaseStudy} />
            ))}
          </div>

          <div className="section-heading additional-projects-heading" data-reveal>
            <p className="section-kicker">More projects</p>
            <h3>Built for campus and the field</h3>
          </div>
          <div className="additional-projects">
            {additionalProjects.map((project, index) => (
              <ProjectStory
                key={project.id}
                project={project}
                index={featuredProjects.length + index}
                variant="secondary"
                onOpenCaseStudy={onOpenCaseStudy}
              />
            ))}
          </div>
        </section>

        <section id="lab" className="portfolio-section lab-section scroll-mt-24">
          <div className="section-heading" data-reveal>
            <p className="section-kicker">Practice and reflection</p>
            <h2>Engineering Lab</h2>
            <p>What I tried, what failed, and what the work taught me.</p>
          </div>
          <div className="lab-grid">
            {LAB_EXPERIMENTS.slice(0, 3).map((experiment) => (
              <article className="lab-card" key={experiment.id} data-reveal>
                <div className="lab-card-heading">
                  <FlaskConical aria-hidden="true" />
                  <span>{experiment.domain}</span>
                </div>
                <h3>{experiment.title}</h3>
                <ol className="lab-story">
                  <li>
                    <span className="lab-story-step">01 / Attempt</span>
                    <p>{experiment.whatITried}</p>
                  </li>
                  <li>
                    <span className="lab-story-step">02 / Failure</span>
                    <p>{experiment.whatFailed}</p>
                  </li>
                  <li>
                    <span className="lab-story-step">03 / What worked</span>
                    <p>{experiment.whatWorked}</p>
                  </li>
                  <li>
                    <span className="lab-story-step">04 / Lesson</span>
                    <p>{experiment.whatILearned}</p>
                  </li>
                </ol>
                <button className="text-link" onClick={() => onOpenLab(experiment.id)}>
                  Full experiment
                  <ArrowUpRight aria-hidden="true" />
                </button>
              </article>
            ))}
          </div>
        </section>

        <section id="skills" className="portfolio-section skills-section scroll-mt-24">
          <div className="section-heading" data-reveal>
            <p className="section-kicker">Supported by the work</p>
            <h2>Skills</h2>
            <p>A focused set of technologies connected to public project repositories.</p>
          </div>
          <div data-reveal><SkillExplorer /></div>
        </section>

        <section id="process" className="portfolio-section process-section scroll-mt-24">
          <div className="section-heading" data-reveal>
            <p className="section-kicker">A practical workflow</p>
            <h2>How I build</h2>
          </div>
          <ol className="process-list" data-reveal>
            {HOW_I_BUILD_STAGES.map((stage) => (
              <li key={stage.step}>
                <span>{stage.step}</span>
                <div>
                  <h3>{stage.name === 'Test' ? 'Validate' : stage.name === 'Ship' ? 'Deploy' : stage.name}</h3>
                  <p>{stage.tagline}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section id="about" className="portfolio-section about-section scroll-mt-24">
          <PortraitFigure className="about-portrait" />
          <div className="about-copy" data-reveal>
            <p className="section-kicker">About</p>
            <h2>Who I am</h2>
            <p>{PORTFOLIO_OWNER.name} — {PORTFOLIO_OWNER.tag}.</p>
            <h3>What I build</h3>
            <p>{PORTFOLIO_OWNER.subline}</p>
            <h3>What I’m looking for</h3>
            <p>{PORTFOLIO_OWNER.lookingFor}.</p>
            <p className="about-location">{PORTFOLIO_OWNER.location}</p>
          </div>
        </section>

        <section id="resume" className="portfolio-section resume-section scroll-mt-24">
          <div className="section-heading" data-reveal>
            <p className="section-kicker">For your review</p>
            <h2>Resume</h2>
            <p>Download the original LPU-format CV, preserving its supplied layout and details.</p>
          </div>
          <div className="resume-sheet" data-reveal>
            <div className="resume-sheet-header">
              <div>
                <h3>{PORTFOLIO_OWNER.name}</h3>
                <p>Original LPU-format CV</p>
              </div>
            </div>
            <p className="resume-original-note">
              This download uses the resume you provided, with its original format and contact details.
            </p>
            <a className="portfolio-button portfolio-button-primary resume-download" href={PORTFOLIO_OWNER.links.resume} download>
              <FileText aria-hidden="true" />
              Download Original Resume PDF
            </a>
          </div>
        </section>

        <section id="contact" className="portfolio-section contact-section scroll-mt-24">
          <div data-reveal>
            <p className="section-kicker">Contact</p>
            <h2>Interested in building something together?</h2>
            <p>Get in touch about software engineering, AI product, or full-stack opportunities.</p>
          </div>
          <div className="contact-actions" data-reveal>
            <a className="portfolio-button portfolio-button-primary" href={`mailto:${PORTFOLIO_OWNER.email}`}>
              <Mail aria-hidden="true" />
              Let's Work Together
            </a>
            <a href={PORTFOLIO_OWNER.links.linkedin} target="_blank" rel="noopener noreferrer">
              <Linkedin aria-hidden="true" />
              LinkedIn
              <ArrowUpRight aria-hidden="true" />
            </a>
            <a href={PORTFOLIO_OWNER.links.github} target="_blank" rel="noopener noreferrer">
              <Github aria-hidden="true" />
              GitHub
              <ArrowUpRight aria-hidden="true" />
            </a>
            <a href={PORTFOLIO_OWNER.links.resume} download>
              <FileText aria-hidden="true" />
              Resume
              <ArrowUpRight aria-hidden="true" />
            </a>
          </div>
          <button className="portfolio-assistant-link" onClick={onOpenAskAi}>
            <Sparkles aria-hidden="true" />
            Ask about my work
          </button>
        </section>

        <footer className="portfolio-footer">
          <span>{PORTFOLIO_OWNER.name}</span>
          <button onClick={onExitRecruiterMode}>Explore the optional 3D experience</button>
        </footer>
      </div>
    </main>
  );
}
