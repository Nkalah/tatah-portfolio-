/**
 * Shared Type Definitions for Tafadzwa.OS
 */

export type ActId =
  | 'boot'
  | 'hero'
  | 'work'
  | 'lab'
  | 'ai-engineering'
  | 'constellation'
  | 'how-i-build'
  | 'design-experience'
  | 'about'
  | 'contact';

export type QualityTier = 'high' | 'medium' | 'low';

export interface SceneCameraTarget {
  position: [number, number, number];
  target: [number, number, number];
  fov?: number;
}

export interface TerminalLog {
  id: string;
  type: 'input' | 'output' | 'error' | 'system';
  text: string;
}

export interface LiveStatusState {
  online: boolean;
  latencyMs: number;
  lastChecked: string;
}
