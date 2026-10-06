/**
 * App.tsx - Main Portfolio Orchestrator ("TAFADZWA.OS")
 * 
 * Cinematic, continuous 3D world with spline camera tracking,
 * Recruiter-first portfolio, structured-data assistant, and optional 3D experience.
 */

import React, { Suspense, lazy, useState, useRef, useEffect } from 'react';
import type { ThreeCanvasRef } from './three/ThreeCanvas.tsx';
import { TopNavigation } from './components/TopNavigation.tsx';
import { RecruiterMode } from './components/RecruiterMode.tsx';
import { ActsOverlay } from './components/ActsOverlay.tsx';
import { CaseStudyModal } from './components/CaseStudyModal.tsx';
import { LabExperimentModal } from './components/LabExperimentModal.tsx';
import { AskPortfolioModal } from './components/AskPortfolioModal.tsx';
import { CommandPalette } from './components/CommandPalette.tsx';
import { MiniTerminal } from './components/MiniTerminal.tsx';
import { CustomCursor } from './components/CustomCursor.tsx';
import { EasterEgg } from './components/EasterEgg.tsx';
import { PROJECTS, LAB_EXPERIMENTS } from './data/portfolioData.ts';
import { QualityTier } from './types/index.ts';
import { soundManager } from './audio/soundManager.ts';

const ThreeCanvas = lazy(() =>
  import('./three/ThreeCanvas.tsx').then((module) => ({ default: module.ThreeCanvas }))
);

export default function App() {
  const [recruiterMode, setRecruiterMode] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedLabId, setSelectedLabId] = useState<string | null>(null);
  const [isAskAiOpen, setIsAskAiOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [quality, setQuality] = useState<QualityTier>('high');
  const [hoveredObject, setHoveredObject] = useState<string | null>(null);
  const [selectedAmbientObject, setSelectedAmbientObject] = useState<{
    title: string;
    detail: string;
  } | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  const canvasRef = useRef<ThreeCanvasRef>(null);

  // Check URL query parameters for direct Recruiter Mode link: ?mode=recruiter or #recruiter
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('mode') === 'recruiter' || window.location.hash === '#recruiter') {
        setRecruiterMode(true);
      } else if (params.get('mode') === '3d') {
        setRecruiterMode(false);
      }
    }
  }, []);

  const handleNavigateToProgress = (progress: number) => {
    soundManager.playWhoosh();
    canvasRef.current?.flyToProgress(progress);
  };

  const handleToggleWireframe = (): boolean => {
    return canvasRef.current?.toggleWireframe() ?? false;
  };

  const handleSetQuality = (newQuality: QualityTier) => {
    setQuality(newQuality);
    canvasRef.current?.setQuality(newQuality);
  };

  const selectedProject = PROJECTS.find((p) => p.id === selectedProjectId) || null;
  const selectedLab = LAB_EXPERIMENTS.find((l) => l.id === selectedLabId) || null;

  return (
    <div className="relative min-h-screen bg-[#030712] text-slate-100 font-sans selection:bg-cyan-500 selection:text-black">
      {/* Custom Contextual Cursor (desktop only) */}
      {!recruiterMode && <CustomCursor />}

      {/* Top Navigation Bar (Clean 3-Zone Contract) */}
      <TopNavigation
        recruiterMode={recruiterMode}
        onToggleRecruiterMode={() => {
          soundManager.playClick();
          setSelectedAmbientObject(null);
          setRecruiterMode(!recruiterMode);
        }}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenAskAi={() => setIsAskAiOpen(true)}
        onNavigateToProgress={handleNavigateToProgress}
      />

      {/* Hover Object HUD Indicator */}
      {selectedAmbientObject && !recruiterMode ? (
        <aside
          aria-live="polite"
          className="fixed bottom-8 left-8 z-30 max-w-xs rounded border border-cyan-500/35 bg-slate-950/90 px-4 py-3 text-cyan-100 shadow-lg backdrop-blur-md"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] tracking-[0.18em] text-cyan-300">
                {selectedAmbientObject.title}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-slate-300">
                {selectedAmbientObject.detail}
              </p>
            </div>
            <button
              type="button"
              aria-label="Dismiss object information"
              className="pointer-events-auto -mr-1 -mt-1 px-1 text-slate-400 hover:text-white"
              onClick={() => setSelectedAmbientObject(null)}
            >
              ×
            </button>
          </div>
        </aside>
      ) : hoveredObject && !recruiterMode && (
        <div className="fixed bottom-8 left-8 z-30 pointer-events-none px-3.5 py-1.5 rounded bg-slate-900/90 border border-cyan-500/40 text-xs font-mono text-cyan-300 backdrop-blur-md shadow-lg animate-in fade-in duration-100 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
          <span>{hoveredObject}</span>
          <span className="text-[10px] text-slate-400 ml-1">· Click to inspect</span>
        </div>
      )}

      {/* Main Viewport Content */}
      {recruiterMode ? (
        /* FAST, 0-3D ACCESSIBLE RECRUITER MODE */
        <RecruiterMode
          onOpenCaseStudy={(id) => {
            soundManager.playClick();
            setSelectedProjectId(id);
          }}
          onOpenAskAi={() => setIsAskAiOpen(true)}
          onOpenLab={setSelectedLabId}
          onExitRecruiterMode={() => setRecruiterMode(false)}
        />
      ) : (
        /* CONTINUOUS 3D WORLD ("TAFADZWA.OS") */
        <>
          <Suspense fallback={<div className="fixed inset-0 z-0 bg-[#030712]" aria-hidden="true" />}>
            <ThreeCanvas
              ref={canvasRef}
              quality={quality}
              onSelectProject={(id) => {
                soundManager.playClick();
                setSelectedProjectId(id);
              }}
              onSelectLab={(id) => {
                soundManager.playClick();
                setSelectedLabId(id);
              }}
              onSelectSkill={() => {
                soundManager.playNodeHover();
              }}
              onHoverObject={setHoveredObject}
              onSelectAmbientObject={(title, detail) => {
                soundManager.playClick();
                setSelectedAmbientObject({ title, detail });
              }}
              onScrollProgressUpdate={setScrollProgress}
            />
          </Suspense>

          {/* Project and portfolio sections synchronized to the 3D view */}
          <ActsOverlay
            onOpenCaseStudy={(id) => {
              soundManager.playClick();
              setSelectedProjectId(id);
            }}
            onOpenLab={(id) => {
              soundManager.playClick();
              setSelectedLabId(id);
            }}
            onOpenAskAi={() => setIsAskAiOpen(true)}
            onToggleWireframe={handleToggleWireframe}
            scrollProgress={scrollProgress}
          />
        </>
      )}

      {/* Interactive Drawers & Modals */}
      <CaseStudyModal
        project={selectedProject}
        onClose={() => setSelectedProjectId(null)}
      />

      <LabExperimentModal
        experiment={selectedLab}
        onClose={() => setSelectedLabId(null)}
      />

      <AskPortfolioModal
        isOpen={isAskAiOpen}
        onClose={() => setIsAskAiOpen(false)}
      />

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigateToProgress={handleNavigateToProgress}
        onSelectProject={(id) => {
          setSelectedProjectId(id);
        }}
        onSelectLab={(id) => {
          setSelectedLabId(id);
        }}
        onToggleWireframe={handleToggleWireframe}
        onOpenAskAi={() => setIsAskAiOpen(true)}
        quality={quality}
        onSetQuality={handleSetQuality}
      />

      {!recruiterMode && (
        <MiniTerminal
          onOpenProject={(id) => {
            setSelectedProjectId(id);
          }}
          onToggleRecruiterMode={() => setRecruiterMode(!recruiterMode)}
          onFlyToProgress={handleNavigateToProgress}
        />
      )}

      {/* Easter Egg Listener (Konami Code & "build") */}
      {!recruiterMode && <EasterEgg />}
    </div>
  );
}
