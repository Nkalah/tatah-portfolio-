/**
 * ThreeCanvas.tsx - React Viewport Container for ThreeScene
 */

import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { ThreeScene, SceneCallbacks } from './ThreeScene.ts';
import { QualityTier } from '../types/index.ts';

export interface ThreeCanvasRef {
  flyToProgress: (progress: number) => void;
  toggleWireframe: () => boolean;
  setQuality: (quality: QualityTier) => void;
}

interface ThreeCanvasProps {
  quality: QualityTier;
  onSelectProject: (projectId: string) => void;
  onSelectLab: (labId: string) => void;
  onSelectSkill: (skillId: string) => void;
  onHoverObject: (title: string | null) => void;
  onSelectAmbientObject?: (title: string, detail: string) => void;
  onScrollProgressUpdate?: (progress: number) => void;
}

export const ThreeCanvas = forwardRef<ThreeCanvasRef, ThreeCanvasProps>(
  (
    {
      quality,
      onSelectProject,
      onSelectLab,
      onSelectSkill,
      onHoverObject,
      onSelectAmbientObject,
      onScrollProgressUpdate,
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const sceneInstanceRef = useRef<ThreeScene | null>(null);

    useImperativeHandle(ref, () => ({
      flyToProgress: (progress: number) => {
        sceneInstanceRef.current?.flyToProgress(progress);
      },
      toggleWireframe: () => {
        return sceneInstanceRef.current?.toggleWireframe() ?? false;
      },
      setQuality: (newQuality: QualityTier) => {
        sceneInstanceRef.current?.setQuality(newQuality);
      },
    }));

    useEffect(() => {
      if (!containerRef.current) return;

      const callbacks: SceneCallbacks = {
        onSelectProject,
        onSelectLab,
        onSelectSkill,
        onHoverObject,
        onSelectAmbientObject,
        onScrollProgressUpdate,
      };

      const scene = new ThreeScene(containerRef.current, callbacks, quality);
      sceneInstanceRef.current = scene;

      return () => {
        scene.destroy();
        sceneInstanceRef.current = null;
      };
    }, []);

    // Update quality dynamically
    useEffect(() => {
      sceneInstanceRef.current?.setQuality(quality);
    }, [quality]);

    return (
      <div
        ref={containerRef}
        className="fixed inset-0 w-full h-full pointer-events-auto z-0 overflow-hidden select-none"
        aria-hidden="true"
      />
    );
  }
);

ThreeCanvas.displayName = 'ThreeCanvas';
