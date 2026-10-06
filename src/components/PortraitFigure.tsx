import portraitUrl from '../portrait-optimized.jpg';
import { lazy, Suspense, useEffect, useState } from 'react';

const CrystallinePortrait = lazy(() =>
  import('./CrystallinePortrait.tsx').then((module) => ({
    default: module.CrystallinePortrait,
  }))
);

interface PortraitFigureProps {
  className?: string;
  enableEffect?: boolean;
}

export function PortraitFigure({ className = '', enableEffect = false }: PortraitFigureProps) {
  const [effectReady, setEffectReady] = useState(false);
  const [canRunEffect, setCanRunEffect] = useState(false);

  useEffect(() => {
    if (!enableEffect) {
      setCanRunEffect(false);
      setEffectReady(false);
      return;
    }
    const media = window.matchMedia(
      '(min-width: 768px) and (prefers-reduced-motion: no-preference)'
    );
    const updateEffectPreference = () => {
      setCanRunEffect(media.matches);
      if (!media.matches) setEffectReady(false);
    };
    updateEffectPreference();
    media.addEventListener('change', updateEffectPreference);
    return () => media.removeEventListener('change', updateEffectPreference);
  }, [enableEffect]);

  return (
    <figure
      className={`portrait-figure ${className}${effectReady ? ' portrait-effect-ready' : ''}`}
    >
      <img
        src={portraitUrl}
        alt="Professional portrait of Tafadzwa Nkala, Software Engineer and AI Developer."
        width="768"
        height="1020"
        fetchPriority="high"
        decoding="async"
      />
      {enableEffect && canRunEffect && (
        <Suspense fallback={null}>
          <CrystallinePortrait
            enabled={enableEffect}
            imageUrl={portraitUrl}
            onReady={setEffectReady}
          />
        </Suspense>
      )}
      <figcaption className="portrait-caption">
        <span>BUILD</span>
        <span className="portrait-caption-divider" aria-hidden="true" />
        <span>WITH INTENT</span>
      </figcaption>
    </figure>
  );
}
