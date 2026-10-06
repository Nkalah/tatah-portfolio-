/** Keyboard-accessible shortcuts for the optional 3D view. */

import React, { useState, useEffect } from 'react';
import {
  Command,
  Search,
  Layers,
  FlaskConical,
  Cpu,
  Sparkles,
  FileText,
  Volume2,
  Box,
  Eye,
  Mail,
  Github,
  Check,
} from 'lucide-react';
import { FEATURED_PROJECT_IDS, PROJECTS, LAB_EXPERIMENTS, PORTFOLIO_OWNER } from '../data/portfolioData.ts';
import { soundManager } from '../audio/soundManager.ts';
import { QualityTier } from '../types/index.ts';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToProgress: (progress: number) => void;
  onSelectProject: (projectId: string) => void;
  onSelectLab: (labId: string) => void;
  onToggleWireframe: () => void;
  onOpenAskAi: () => void;
  quality: QualityTier;
  onSetQuality: (quality: QualityTier) => void;
}

export function CommandPalette({
  isOpen,
  onClose,
  onNavigateToProgress,
  onSelectProject,
  onSelectLab,
  onToggleWireframe,
  onOpenAskAi,
  quality,
  onSetQuality,
}: CommandPaletteProps) {
  const [search, setSearch] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open handled by parent, but we can also toggle
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleAction = (action: () => void) => {
    soundManager.playClick();
    action();
    onClose();
  };

  const filteredProjects = PROJECTS.filter((p) => FEATURED_PROJECT_IDS.includes(p.id)).filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.tagline.toLowerCase().includes(search.toLowerCase())
  );

  const filteredLab = LAB_EXPERIMENTS.filter((l) =>
    l.title.toLowerCase().includes(search.toLowerCase()) ||
    l.domain.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div
        className="w-full max-w-xl bg-[#090d16] border border-slate-800 rounded-xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[75vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Search Input */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-800 bg-[#070b13]">
          <Search className="w-4 h-4 text-slate-400 mr-3 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Type a project, section, or action..."
            className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none font-mono"
            autoFocus
          />
          <kbd className="hidden sm:inline px-2 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-800 rounded border border-slate-700">
            ESC
          </kbd>
        </div>

        {/* Command List */}
        <div className="overflow-y-auto p-2 space-y-4 text-xs font-mono">
          {/* Section navigation */}
          <div>
            <div className="px-3 py-1 text-[10px] text-slate-500 uppercase tracking-wider">
              Jump to section
            </div>
            <div className="space-y-0.5 mt-1">
              <button
                onClick={() => handleAction(() => onNavigateToProgress(0))}
                className="w-full flex items-center justify-between px-3 py-2 rounded text-slate-300 hover:bg-slate-800/80 hover:text-white transition-colors cursor-pointer"
              >
                <span>Home</span>
                <span className="text-[11px] text-slate-500">Jump →</span>
              </button>
              <button
                onClick={() => handleAction(() => onNavigateToProgress(0.12))}
                className="w-full flex items-center justify-between px-3 py-2 rounded text-slate-300 hover:bg-slate-800/80 hover:text-white transition-colors cursor-pointer"
              >
                <span>Selected projects</span>
                <span className="text-[11px] text-slate-500">Jump →</span>
              </button>
              <button
                onClick={() => handleAction(() => onNavigateToProgress(0.42))}
                className="w-full flex items-center justify-between px-3 py-2 rounded text-slate-300 hover:bg-slate-800/80 hover:text-white transition-colors cursor-pointer"
              >
                <span>Engineering lab</span>
                <span className="text-[11px] text-slate-500">Jump →</span>
              </button>
              <button
                onClick={() => handleAction(() => onNavigateToProgress(0.56))}
                className="w-full flex items-center justify-between px-3 py-2 rounded text-slate-300 hover:bg-slate-800/80 hover:text-white transition-colors cursor-pointer"
              >
                <span>ExplainAI answer flow</span>
                <span className="text-[11px] text-slate-500">Jump →</span>
              </button>
              <button
                onClick={() => handleAction(() => onNavigateToProgress(0.68))}
                className="w-full flex items-center justify-between px-3 py-2 rounded text-slate-300 hover:bg-slate-800/80 hover:text-white transition-colors cursor-pointer"
              >
                <span>Skills</span>
                <span className="text-[11px] text-slate-500">Jump →</span>
              </button>
              <button
                onClick={() => handleAction(() => onNavigateToProgress(0.98))}
                className="w-full flex items-center justify-between px-3 py-2 rounded text-slate-300 hover:bg-slate-800/80 hover:text-white transition-colors cursor-pointer"
              >
                <span>Contact</span>
                <span className="text-[11px] text-slate-500">Jump →</span>
              </button>
            </div>
          </div>

          {/* System Toggles */}
          <div>
            <div className="px-3 py-1 text-[10px] text-slate-500 uppercase tracking-wider">
              3D tools
            </div>
            <div className="space-y-0.5 mt-1">
              <button
                onClick={() => handleAction(onToggleWireframe)}
                className="w-full flex items-center justify-between px-3 py-2 rounded text-slate-300 hover:bg-slate-800/80 hover:text-cyan-300 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Box className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Toggle wireframe view</span>
                </div>
                <span className="text-[10px] text-cyan-400">3D view</span>
              </button>

              <button
                onClick={() => handleAction(onOpenAskAi)}
                className="w-full flex items-center justify-between px-3 py-2 rounded text-slate-300 hover:bg-slate-800/80 hover:text-cyan-300 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Ask about this portfolio</span>
                </div>
                <span className="text-[10px] text-slate-500">Inquiry</span>
              </button>

              <button
                onClick={() => handleAction(() => soundManager.toggleMute())}
                className="w-full flex items-center justify-between px-3 py-2 rounded text-slate-300 hover:bg-slate-800/80 hover:text-white transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Toggle Sound Synthesizer</span>
                </div>
                <span className="text-[10px] text-slate-500">Web Audio</span>
              </button>

              <div className="flex items-center justify-between px-3 py-2 text-slate-400">
                <span>Graphics Quality Tier:</span>
                <div className="flex items-center gap-1">
                  {(['high', 'medium', 'low'] as QualityTier[]).map((q) => (
                    <button
                      key={q}
                      onClick={() => onSetQuality(q)}
                      className={`px-2 py-0.5 text-[10px] rounded uppercase ${
                        quality === q ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Filtered Projects */}
          <div>
            <div className="px-3 py-1 text-[10px] text-slate-500 uppercase tracking-wider">
              Projects & Case Studies ({filteredProjects.length})
            </div>
            <div className="space-y-0.5 mt-1">
              {filteredProjects.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleAction(() => onSelectProject(p.id))}
                  className="w-full flex items-center justify-between px-3 py-2 rounded text-slate-300 hover:bg-slate-800/80 hover:text-white transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.accentColor }} />
                    <span className="font-semibold">{p.title}</span>
                    <span className="text-slate-500 text-[11px] truncate hidden sm:inline">
                      — {p.tagline}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 shrink-0">Open Case Study →</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quick External Links */}
          <div>
            <div className="px-3 py-1 text-[10px] text-slate-500 uppercase tracking-wider">
              External Proof & Direct Links
            </div>
            <div className="space-y-0.5 mt-1">
              <a
                href={PORTFOLIO_OWNER.links.resume}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-between px-3 py-2 rounded text-slate-300 hover:bg-slate-800/80 hover:text-white transition-colors"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Download Tafadzwa's Resume (PDF)</span>
                </div>
                <span className="text-[10px] text-slate-500">External</span>
              </a>

              <a
                href={PORTFOLIO_OWNER.links.github}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-between px-3 py-2 rounded text-slate-300 hover:bg-slate-800/80 hover:text-white transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Github className="w-3.5 h-3.5" />
                  <span>GitHub Profile</span>
                </div>
                <span className="text-[10px] text-slate-500">External</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
