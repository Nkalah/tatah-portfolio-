import React, { useState } from 'react';
import { ArrowUpRight, ExternalLink, Github } from 'lucide-react';
import type { Project } from '../data/portfolioData.ts';

interface ProjectStoryProps {
  project: Project;
  index: number;
  onOpenCaseStudy: (projectId: string) => void;
  variant?: 'featured' | 'secondary';
}

export function ProjectStory({
  project,
  index,
  onOpenCaseStudy,
  variant = 'featured',
}: ProjectStoryProps) {
  const stages = project.storyStages ?? project.architecture.map((name, stageIndex) => ({
    id: `${project.id}-${stageIndex}`,
    name,
    description: name,
  }));
  const [activeStage, setActiveStage] = useState(0);
  const isExplainAi = project.id === 'explainai';
  const isKaziLink = project.id === 'kazilink';

  return (
    <article
      className={`story-project story-project--${project.id} story-project--${variant}${variant === 'featured' && index === 0 ? ' story-project--lead' : ''}`}
      data-reveal
      onPointerMove={(event) => {
        if (event.pointerType !== 'mouse') return;
        const bounds = event.currentTarget.getBoundingClientRect();
        event.currentTarget.style.setProperty('--spotlight-x', `${event.clientX - bounds.left}px`);
        event.currentTarget.style.setProperty('--spotlight-y', `${event.clientY - bounds.top}px`);
      }}
      onPointerLeave={(event) => {
        event.currentTarget.style.removeProperty('--spotlight-x');
        event.currentTarget.style.removeProperty('--spotlight-y');
      }}
    >
      <div className={`project-preview${project.previewImage ? '' : ' project-preview--illustration'}`}>
        {project.previewImage ? (
          <a
            className="project-preview-link"
            href={project.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open ${project.title} live project`}
          >
            <img
              src={project.previewImage}
              alt={project.previewAlt ?? `${project.title} project preview`}
              loading="lazy"
              decoding="async"
              width="1440"
              height="1050"
            />
            <span className="project-preview-label">Live project</span>
            <span className="project-preview-open" aria-hidden="true"><ArrowUpRight /></span>
          </a>
        ) : (
          <div className="explainai-preview" role="img" aria-label="ExplainAI answer flow illustration">
            <div className="explainai-preview-top">
              <span className="explainai-preview-brand"><span aria-hidden="true">A</span> ExplainAI</span>
              <span>AI ANSWER ENGINE</span>
            </div>
            <p className="explainai-preview-prompt">A question becomes a grounded answer.</p>
            <div className="explainai-preview-flow">
              {stages.slice(0, 4).map((stage, stageIndex) => (
                <React.Fragment key={stage.id}>
                  {stageIndex > 0 && <span className="explainai-preview-connector" aria-hidden="true" />}
                  <span className="explainai-preview-stage">
                    <span>0{stageIndex + 1}</span>
                    {stage.name}
                  </span>
                </React.Fragment>
              ))}
            </div>
            <span className="project-preview-label">Answer flow</span>
          </div>
        )}
      </div>

      <header className="story-project-heading">
        <span className="story-project-index">0{index + 1}</span>
        <div>
          <p className="case-study-category">{project.category}</p>
          <h3>{project.title}</h3>
          <p className="case-study-tagline">{project.tagline}</p>
        </div>
      </header>

      <div className="project-card-copy">
        <p>{project.summary}</p>
        <div className="technology-list" aria-label={`${project.title} technologies`}>
          {project.builtWith.slice(0, 4).map((technology) => <span key={technology}>{technology}</span>)}
        </div>
        <div className="project-card-actions">
          <div className="project-links">
            {project.liveUrl && (
              <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink aria-hidden="true" />
                Live project
                <ArrowUpRight aria-hidden="true" />
              </a>
            )}
            {project.githubUrl && (
              <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                <Github aria-hidden="true" />
                GitHub
                <ArrowUpRight aria-hidden="true" />
              </a>
            )}
          </div>
          <button className="text-link" onClick={() => onOpenCaseStudy(project.id)}>
            Case study
            <ArrowUpRight aria-hidden="true" />
          </button>
        </div>
      </div>

      <details className="project-details">
        <summary>Explore problem, contribution &amp; system flow</summary>
        <div className="story-project-body">
          <section className="story-beat story-problem">
            <p className="story-stage-label">01 / The problem</p>
            <h4>{project.problem}</h4>
          </section>

          <section className="story-beat story-system" aria-label={`${project.title} system flow`}>
            <div className="story-stage-intro">
              <p className="story-stage-label">02 / The system</p>
              <h4>{isKaziLink ? 'Problem → People → Marketplace → Connection' : 'A system, step by step'}</h4>
            </div>

            <div
              className={isKaziLink ? 'marketplace-flow' : 'story-flow'}
              role="tablist"
              aria-label={`${project.title} system stages`}
            >
              {stages.map((stage, stageIndex) => (
                <React.Fragment key={stage.id}>
                  {stageIndex > 0 && (
                    <span className={isKaziLink ? 'marketplace-connector' : 'story-connector'} aria-hidden="true" />
                  )}
                  <button
                    className={`story-node${activeStage === stageIndex ? ' is-active' : ''}`}
                    id={`${project.id}-stage-${stage.id}`}
                    role="tab"
                    aria-selected={activeStage === stageIndex}
                    aria-controls={`${project.id}-stage-description`}
                    onClick={() => setActiveStage(stageIndex)}
                  >
                    {stage.name}
                  </button>
                </React.Fragment>
              ))}
            </div>

            <p
              className="story-stage-description"
              id={`${project.id}-stage-description`}
              role="tabpanel"
              aria-labelledby={`${project.id}-stage-${stages[activeStage].id}`}
            >
              {stages[activeStage].description}
            </p>
            <p className="story-system-note">Flow summarized from the public project record.</p>
          </section>

          <section className="story-beat story-product">
            <p className="story-stage-label">03 / The product</p>
            <div className="story-product-frame">
              <span className="story-product-mark" aria-hidden="true">{project.title.slice(0, 2).toUpperCase()}</span>
              <div>
                <h4>{project.title}</h4>
                <p>{project.whatIBuilt}</p>
              </div>
            </div>
          </section>

          <section className="story-beat story-contribution">
            <p className="story-stage-label">04 / My contribution</p>
            <p className="story-contribution-copy">{project.myRole}</p>
          </section>

          <section className="story-beat story-engineering">
            <div>
              <p className="story-stage-label">05 / Engineering challenge</p>
              <p>{project.engineeringChallenge}</p>
            </div>
            <div>
              <p className="story-stage-label">What I learned</p>
              <p>{project.whatILearned}</p>
            </div>
          </section>

          <footer className="story-beat story-result">
            <div>
              <p className="story-stage-label">06 / Result</p>
              <p>{project.outcome ?? project.whatThisDemonstrates}</p>
            </div>
          </footer>
        </div>
      </details>
    </article>
  );
}
