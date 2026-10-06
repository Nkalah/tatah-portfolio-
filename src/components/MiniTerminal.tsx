/**
 * MiniTerminal.tsx - Interactive Mini Developer Console
 * 
 * Supports commands:
 * `whoami`, `ls projects/`, `cat philosophy.txt`, `open <project>`, `mode recruiter`, `help`, `clear`
 */

import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, X, Minimize2, Maximize2 } from 'lucide-react';
import { FEATURED_PROJECT_IDS, PORTFOLIO_OWNER, PROJECTS } from '../data/portfolioData.ts';
import { soundManager } from '../audio/soundManager.ts';

interface MiniTerminalProps {
  onOpenProject: (projectId: string) => void;
  onToggleRecruiterMode: () => void;
  onFlyToProgress: (progress: number) => void;
}

export function MiniTerminal({
  onOpenProject,
  onToggleRecruiterMode,
  onFlyToProgress,
}: MiniTerminalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<Array<{ type: 'in' | 'out'; text: string }>>([
    { type: 'out', text: 'TAFADZWA.OS v2.4 (Interactive Shell)' },
    { type: 'out', text: 'Type "help" to list available commands.' },
  ]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history, isOpen]);

  const executeCommand = (cmdStr: string) => {
    const raw = cmdStr.trim();
    if (!raw) return;

    soundManager.playClick();
    const newHistory = [...history, { type: 'in' as const, text: `$ ${raw}` }];
    const cmd = raw.toLowerCase();

    if (cmd === 'clear') {
      setHistory([]);
      return;
    }

    if (cmd === 'help') {
      newHistory.push({
        type: 'out',
        text: `Available commands:
  whoami            - Print portfolio engineer profile
  cat philosophy.txt - Output Tafadzwa's core engineering principle
  ls projects/      - List all project modules
  open <id>         - Open case study (e.g. "open explainai")
  fly <act>         - Jump camera: hero, work, lab, ai, stack, contact
  mode recruiter    - Switch to zero-3D fast recruiter mode
  clear             - Clear terminal screen`,
      });
    } else if (cmd === 'whoami') {
      newHistory.push({
        type: 'out',
        text: `${PORTFOLIO_OWNER.name} — ${PORTFOLIO_OWNER.identity}\n${PORTFOLIO_OWNER.tag}\nStatus: ${PORTFOLIO_OWNER.statusBadge}`,
      });
    } else if (cmd === 'cat philosophy.txt') {
      newHistory.push({
        type: 'out',
        text: `"${PORTFOLIO_OWNER.philosophy}"`,
      });
    } else if (cmd.startsWith('ls')) {
      const list = PROJECTS
        .filter((project) => FEATURED_PROJECT_IDS.includes(project.id))
        .map((p) => `  ${p.id.padEnd(20)} [${p.category}] - ${p.title}`).join('\n');
      newHistory.push({
        type: 'out',
        text: `PROJECT MODULES:\n${list}`,
      });
    } else if (cmd.startsWith('open ')) {
      const targetId = cmd.replace('open ', '').trim();
      const proj = PROJECTS.find((p) =>
        FEATURED_PROJECT_IDS.includes(p.id) &&
        (p.id === targetId || p.title.toLowerCase() === targetId)
      );
      if (proj) {
        newHistory.push({ type: 'out', text: `Opening case study for ${proj.title}...` });
        onOpenProject(proj.id);
      } else {
        newHistory.push({ type: 'out', text: `Project "${targetId}" not found. Type "ls" for available IDs.` });
      }
    } else if (cmd.startsWith('fly ')) {
      const act = cmd.replace('fly ', '').trim();
      const actMap: Record<string, number> = {
        hero: 0,
        work: 0.12,
        lab: 0.42,
        ai: 0.56,
        stack: 0.68,
        contact: 0.98,
      };
      if (actMap[act] !== undefined) {
        newHistory.push({ type: 'out', text: `Flying camera spline to ${act}...` });
        onFlyToProgress(actMap[act]);
      } else {
        newHistory.push({ type: 'out', text: `Unknown act "${act}". Try: hero, work, lab, ai, stack, contact` });
      }
    } else if (cmd === 'mode recruiter') {
      newHistory.push({ type: 'out', text: 'Toggling Recruiter Mode...' });
      onToggleRecruiterMode();
    } else {
      newHistory.push({
        type: 'out',
        text: `Command not recognized: "${raw}". Type "help" for valid commands.`,
      });
    }

    setHistory(newHistory);
  };

  return (
    <div className="fixed bottom-5 right-5 z-40">
      {!isOpen ? (
        <button
          onClick={() => {
            soundManager.playClick();
            setIsOpen(true);
          }}
          className="flex items-center gap-2 px-3 py-2 text-xs font-mono text-cyan-300 bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 rounded-lg shadow-xl backdrop-blur-md transition-all cursor-pointer"
          title="Open interactive mini terminal"
        >
          <TerminalIcon className="w-3.5 h-3.5 text-cyan-400" />
          <span>terminal</span>
        </button>
      ) : (
        <div className="w-80 sm:w-96 h-72 flex flex-col bg-[#070b13]/95 border border-slate-800 rounded-lg shadow-2xl backdrop-blur-lg overflow-hidden text-xs font-mono">
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800 bg-[#05080e] select-none">
            <div className="flex items-center gap-2 text-slate-400 text-[11px]">
              <TerminalIcon className="w-3 h-3 text-cyan-400" />
              <span>tafadzwa@os:~</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Console Output */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1.5 text-slate-300 text-[11px] leading-relaxed">
            {history.map((h, i) => (
              <div
                key={i}
                className={h.type === 'in' ? 'text-cyan-400 font-semibold' : 'text-slate-300 whitespace-pre-wrap'}
              >
                {h.text}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input Line */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              executeCommand(input);
              setInput('');
            }}
            className="flex items-center px-3 py-2 border-t border-slate-800/80 bg-[#05080e]"
          >
            <span className="text-cyan-400 mr-2">$</span>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="type help, whoami, ls..."
              className="flex-1 bg-transparent text-white focus:outline-none text-[11px]"
              autoFocus
            />
          </form>
        </div>
      )}
    </div>
  );
}
