/**
 * LabExperimentModal.tsx - The Lab Deep-Dive Drawer
 * 
 * Shows: WHAT I TRIED / WHAT WORKED / WHAT FAILED / WHAT I LEARNED / WOULD BUILD NEXT
 */

import React, { useEffect } from 'react';
import { X, FlaskConical, AlertTriangle, CheckCircle, Lightbulb, ArrowRight } from 'lucide-react';
import { LabExperiment } from '../data/portfolioData.ts';

interface LabExperimentModalProps {
  experiment: LabExperiment | null;
  onClose: () => void;
}

export function LabExperimentModal({ experiment, onClose }: LabExperimentModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!experiment) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-[#090d16] border border-purple-500/30 rounded-xl shadow-2xl overflow-hidden text-slate-100"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#070b13]">
          <div className="flex items-center gap-2.5">
            <FlaskConical className="w-4 h-4 text-purple-400" />
            <span className="font-mono text-xs text-purple-400">{experiment.domain}</span>
            <span className="text-slate-600">·</span>
            <h3 className="font-display font-bold text-white text-base">{experiment.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs">
          <div className="p-3.5 rounded bg-slate-950/60 border border-slate-800/80">
            <span className="font-mono text-slate-400 uppercase tracking-wider block mb-1">
              What I Tried:
            </span>
            <p className="text-slate-200 leading-relaxed">{experiment.whatITried}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 rounded bg-emerald-950/20 border border-emerald-500/30">
              <div className="flex items-center gap-1.5 text-emerald-400 font-mono uppercase tracking-wider mb-1">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>What Worked</span>
              </div>
              <p className="text-slate-200 leading-relaxed">{experiment.whatWorked}</p>
            </div>

            <div className="p-3.5 rounded bg-rose-950/20 border border-rose-500/30">
              <div className="flex items-center gap-1.5 text-rose-400 font-mono uppercase tracking-wider mb-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>What Failed</span>
              </div>
              <p className="text-slate-200 leading-relaxed">{experiment.whatFailed}</p>
            </div>
          </div>

          <div className="p-3.5 rounded bg-cyan-950/20 border border-cyan-500/30">
            <div className="flex items-center gap-1.5 text-cyan-400 font-mono uppercase tracking-wider mb-1">
              <Lightbulb className="w-3.5 h-3.5" />
              <span>What I Learned</span>
            </div>
            <p className="text-slate-200 leading-relaxed">{experiment.whatILearned}</p>
          </div>

          <div className="p-3.5 rounded bg-purple-950/20 border border-purple-500/30">
            <div className="flex items-center gap-1.5 text-purple-300 font-mono uppercase tracking-wider mb-1">
              <ArrowRight className="w-3.5 h-3.5 text-purple-400" />
              <span>What I Would Build Next</span>
            </div>
            <p className="text-slate-200 leading-relaxed">{experiment.wouldBuildNext}</p>
          </div>

          <div className="flex items-center gap-2 pt-2 text-[11px] font-mono text-slate-400">
            <span>Stack:</span>
            <span>{experiment.technologies.join(' · ')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
