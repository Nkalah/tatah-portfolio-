/** Detailed project evidence and, where available, an interactive answer-flow explorer. */

import React, { useState, useEffect } from 'react';
import {
  X,
  ExternalLink,
  Github,
  CheckCircle2,
  Play,
  Terminal,
  Activity,
  Layers,
  Cpu,
} from 'lucide-react';
import { Project, ProjectPipelineStage } from '../data/portfolioData.ts';

interface CaseStudyModalProps {
  project: Project | null;
  onClose: () => void;
}

export function CaseStudyModal({ project, onClose }: CaseStudyModalProps) {
  const [activePipelineStage, setActivePipelineStage] = useState<ProjectPipelineStage | null>(null);
  const [showLivePreview, setShowLivePreview] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (project?.pipelineStages && project.pipelineStages.length > 0) {
      setActivePipelineStage(project.pipelineStages[0]);
    }
    setShowLivePreview(false);
  }, [project]);

  if (!project) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-[#090d16] border border-slate-800 rounded-xl shadow-2xl overflow-hidden text-slate-100"
        role="dialog"
        aria-modal="true"
        aria-labelledby="case-study-title"
      >
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-[#070b13]">
          <div className="flex items-center gap-3">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: project.accentColor }}
            />
            <h2 id="case-study-title" className="text-lg font-display font-bold text-white">
              {project.title}
            </h2>
            <span className="text-slate-500 font-mono text-xs hidden sm:inline">·</span>
            <span className="text-xs font-mono text-slate-400 hidden sm:inline">
              {project.category}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-6 sm:p-8 space-y-8">
          {/* Tagline & Executive Summary */}
          <div>
            <p className="text-base font-medium text-cyan-300 mb-3">{project.tagline}</p>
            <p className="text-sm text-slate-300 leading-relaxed">{project.summary}</p>
          </div>

          {/* ExplainAI Interactive Pipeline Inspector */}
          {project.pipelineStages && project.pipelineStages.length > 0 && (
            <div className="p-5 rounded-lg bg-slate-950/70 border border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono uppercase tracking-wider text-cyan-400">
                  ExplainAI answer flow
                </span>
                <span className="text-[11px] text-slate-400 font-mono">Click a stage to inspect</span>
              </div>

              {/* Pipeline Step Tabs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-1.5 mb-4">
                {project.pipelineStages.map((stage, idx) => {
                  const isActive = activePipelineStage?.id === stage.id;
                  return (
                    <button
                      key={stage.id}
                      onClick={() => setActivePipelineStage(stage)}
                      className={`px-2 py-2 text-center rounded text-xs font-mono transition-all cursor-pointer ${
                        isActive
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                          : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <div className="text-[10px] text-slate-500 mb-0.5">{`0${idx + 1}`}</div>
                      <div className="truncate font-semibold">{stage.name}</div>
                    </button>
                  );
                })}
              </div>

              {/* Selected Stage Detail Panel */}
              {activePipelineStage && (
                <div className="p-4 rounded bg-[#030712] border border-cyan-500/30 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-white">{activePipelineStage.name}</span>
                      <span className="text-slate-500">·</span>
                      <span className="text-cyan-400 font-mono">{activePipelineStage.role}</span>
                    </div>
                    <p className="text-slate-300 leading-normal">{activePipelineStage.description}</p>
                  </div>
                  <div className="shrink-0 text-slate-400 font-mono text-[11px] bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
                    Engine: {activePipelineStage.tech}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* AI Crypto Predictor Honest ML Breakdown */}
          {project.mlDetails && (
            <div className="p-5 rounded-lg bg-emerald-950/20 border border-emerald-500/30">
              <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 block mb-2">
                Honest ML System Methodology
              </span>
              <p className="text-xs text-slate-300 mb-3 leading-relaxed">
                {project.mlDetails.honestDisclaimer}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded bg-slate-950/80 border border-slate-800">
                  <span className="text-slate-400 block font-mono text-[11px] mb-1">Model Architecture:</span>
                  <span className="text-white font-medium">{project.mlDetails.modelType}</span>
                </div>
                <div className="p-3 rounded bg-slate-950/80 border border-slate-800">
                  <span className="text-slate-400 block font-mono text-[11px] mb-1">Validation Protocol:</span>
                  <span className="text-white font-medium">{project.mlDetails.validationMethod}</span>
                </div>
              </div>
            </div>
          )}

          {/* Problem & What I Built Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-lg bg-slate-950/50 border border-slate-800/80">
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
                01. The Problem
              </h3>
              <p className="text-sm text-slate-200 leading-relaxed">{project.problem}</p>
            </div>

            <div className="p-5 rounded-lg bg-slate-950/50 border border-slate-800/80">
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
                02. What I Built
              </h3>
              <p className="text-sm text-slate-200 leading-relaxed">{project.whatIBuilt}</p>
            </div>

            <div className="p-5 rounded-lg bg-slate-950/50 border border-slate-800/80 md:col-span-2">
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-300 mb-2">
                03. My Contribution
              </h3>
              <p className="text-sm text-slate-200 leading-relaxed">{project.myRole}</p>
            </div>
          </div>

          {/* Architecture Highlights */}
          <div className="p-5 rounded-lg bg-slate-950/50 border border-slate-800/80">
            <h3 className="text-xs font-mono uppercase tracking-wider text-cyan-400 mb-3">
              04. Architecture & Data Flow
            </h3>
            <ul className="space-y-2 text-sm text-slate-200">
              {project.architecture.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="font-mono text-cyan-500 mt-0.5">{`[0${idx + 1}]`}</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Core Engineering Challenge & What I Learned */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-lg bg-slate-950/50 border border-slate-800/80">
              <h3 className="text-xs font-mono uppercase tracking-wider text-amber-400 mb-2">
                05. Engineering Challenge
              </h3>
              <p className="text-sm text-slate-200 leading-relaxed">
                {project.engineeringChallenge}
              </p>
            </div>

            <div className="p-5 rounded-lg bg-slate-950/50 border border-slate-800/80">
              <h3 className="text-xs font-mono uppercase tracking-wider text-emerald-400 mb-2">
                06. Key Takeaways & Lessons
              </h3>
              <p className="text-sm text-slate-200 leading-relaxed">{project.whatILearned}</p>
            </div>
          </div>

          {/* Built With & Competencies Demonstrated */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded bg-slate-900/40 border border-slate-800 text-xs">
            <div>
              <span className="font-mono text-slate-400 block mb-1">Demonstrates:</span>
              <span className="text-slate-200">{project.whatThisDemonstrates}</span>
            </div>
            <div className="shrink-0">
              <span className="font-mono text-slate-400 block mb-1">Tech Stack:</span>
              <div className="flex flex-wrap gap-1.5 text-slate-300">
                {project.builtWith.join(' · ')}
              </div>
            </div>
          </div>

          {/* Live Preview Iframe Option */}
          {project.liveUrl && project.liveUrl !== '/' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-slate-400">Embedded Sandbox Preview</span>
                <button
                  onClick={() => setShowLivePreview(!showLivePreview)}
                  className="text-xs font-mono text-cyan-400 hover:text-cyan-300 underline cursor-pointer"
                >
                  {showLivePreview ? 'Hide Preview ↑' : 'Load Live Preview ↓'}
                </button>
              </div>

              {showLivePreview && (
                <div className="w-full h-80 rounded-lg overflow-hidden border border-slate-800 bg-slate-950">
                  <iframe
                    src={project.liveUrl}
                    title={`${project.title} live preview`}
                    className="w-full h-full border-0"
                    loading="lazy"
                    sandbox="allow-scripts allow-same-origin"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Proof Links */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800/80 bg-[#070b13]">
          <div className="text-xs text-slate-400 font-mono">
            Source: <span className="text-white">{project.proof.codeLabel || 'Project record'}</span>
          </div>

          <div className="flex items-center gap-3">
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-900 border border-slate-700 rounded transition-colors"
              >
                <Github className="w-3.5 h-3.5" />
                <span>Code Repository</span>
              </a>
            )}

            {project.liveUrl && project.liveUrl !== '/' && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open Live Project</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
