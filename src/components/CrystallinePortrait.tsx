import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface CrystallinePortraitProps {
  enabled: boolean;
  imageUrl: string;
  onReady: (ready: boolean) => void;
}

const hash = (x: number, y: number) => {
  const value = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return value - Math.floor(value);
};

function createShardGeometry(
  columns: number,
  rows: number,
  imageAspect: number,
  frameAspect: number
) {
  const positions: number[] = [];
  const uvs: number[] = [];
  const centers: number[] = [];
  const directions: number[] = [];
  const seeds: number[] = [];
  const starts: number[] = [];
  const barycentrics: number[] = [];
  const points: Array<[number, number]> = [];

  for (let y = 0; y <= rows; y += 1) {
    for (let x = 0; x <= columns; x += 1) {
      const edge = x === 0 || y === 0 || x === columns || y === rows;
      const jitterX = edge ? 0 : (hash(x, y) - 0.5) * 0.34;
      const jitterY = edge ? 0 : (hash(y + 37, x + 19) - 0.5) * 0.34;
      points.push([
        (x + jitterX) / columns - 0.5,
        0.5 - (y + jitterY) / rows,
      ]);
    }
  }

  const frameUvAspect = frameAspect;
  let visibleWidth = 1;
  let visibleHeight = 1;
  let offsetX = 0;
  let offsetY = 0;

  if (imageAspect > frameUvAspect) {
    visibleWidth = frameUvAspect / imageAspect;
    offsetX = (1 - visibleWidth) * 0.5;
  } else {
    visibleHeight = imageAspect / frameUvAspect;
    offsetY = (1 - visibleHeight) * 0.16;
  }

  const appendTriangle = (
    indices: [number, number, number],
    triangleIndex: number
  ) => {
    const triangle = indices.map((index) => points[index]);
    const centerX = (triangle[0][0] + triangle[1][0] + triangle[2][0]) / 3;
    const centerY = (triangle[0][1] + triangle[1][1] + triangle[2][1]) / 3;
    const seed = hash(triangleIndex, columns + rows);
    const imageY = 0.5 - centerY;
    const faceDistance =
      (centerX / 0.19) ** 2 + ((imageY - 0.2) / 0.22) ** 2;
    const faceProtection = Math.exp(-faceDistance * 1.4);
    const start = THREE.MathUtils.lerp(
      0.1 + seed * 0.2,
      0.62 + seed * 0.18,
      faceProtection
    );
    const angle = seed * Math.PI * 2;
    const radialX = centerX * 0.85 + Math.cos(angle) * 0.48;
    const radialY = -Math.abs(Math.sin(angle) * 0.4) + centerY * 0.25;
    const directionLength = Math.hypot(radialX, radialY, (seed - 0.5) * 1.1) || 1;
    const direction = [
      radialX / directionLength,
      radialY / directionLength,
      ((seed - 0.5) * 1.1) / directionLength,
    ];

    triangle.forEach(([x, y], vertexIndex) => {
      const imageX = x + 0.5;
      const imageYFromTop = 0.5 - y;
      positions.push(x, y, 0);
      uvs.push(
        offsetX + imageX * visibleWidth,
        1 - (offsetY + imageYFromTop * visibleHeight)
      );
      centers.push(centerX, centerY, 0);
      directions.push(direction[0], direction[1], direction[2]);
      seeds.push(seed);
      starts.push(start);
      barycentrics.push(
        vertexIndex === 0 ? 1 : 0,
        vertexIndex === 1 ? 1 : 0,
        vertexIndex === 2 ? 1 : 0
      );
    });
  };

  let triangleIndex = 0;
  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < columns; x += 1) {
      const topLeft = y * (columns + 1) + x;
      const topRight = topLeft + 1;
      const bottomLeft = topLeft + columns + 1;
      const bottomRight = bottomLeft + 1;
      if (hash(x, y) > 0.5) {
        appendTriangle([topLeft, topRight, bottomLeft], triangleIndex++);
        appendTriangle([topRight, bottomRight, bottomLeft], triangleIndex++);
      } else {
        appendTriangle([topLeft, topRight, bottomRight], triangleIndex++);
        appendTriangle([topLeft, bottomRight, bottomLeft], triangleIndex++);
      }
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setAttribute('aCenter', new THREE.Float32BufferAttribute(centers, 3));
  geometry.setAttribute('aDirection', new THREE.Float32BufferAttribute(directions, 3));
  geometry.setAttribute('aSeed', new THREE.Float32BufferAttribute(seeds, 1));
  geometry.setAttribute('aStart', new THREE.Float32BufferAttribute(starts, 1));
  geometry.setAttribute('aBarycentric', new THREE.Float32BufferAttribute(barycentrics, 3));
  return geometry;
}

export function CrystallinePortrait({
  enabled,
  imageUrl,
  onReady,
}: CrystallinePortraitProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const readyRef = useRef(onReady);
  readyRef.current = onReady;

  useEffect(() => {
    const host = hostRef.current;
    const supportsEffect = window.matchMedia(
      '(min-width: 768px) and (prefers-reduced-motion: no-preference)'
    );
    if (!enabled || !host || !supportsEffect.matches) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: window.devicePixelRatio <= 1.5,
        powerPreference: 'low-power',
        depth: false,
        stencil: false,
      });
    } catch (error) {
      console.warn('Crystalline portrait unavailable; showing the original photo.', error);
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 1, 3000);
    const textureLoader = new THREE.TextureLoader();
    const maxPixelRatio = window.devicePixelRatio > 2 ? 1.5 : window.devicePixelRatio;
    renderer.setPixelRatio(Math.min(maxPixelRatio, 1.5));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    host.appendChild(renderer.domElement);

    let texture: THREE.Texture | null = null;
    let geometry: THREE.BufferGeometry | null = null;
    let material: THREE.ShaderMaterial | null = null;
    let mesh: THREE.Mesh | null = null;
    let frameId: number | null = null;
    let active = true;
    let disposed = false;
    let targetProgress = 0;
    let currentProgress = 0;
    let lastWidth = 0;
    let lastHeight = 0;
    let isReady = false;

    const render = () => {
      if (disposed || !active || !material || !mesh) {
        frameId = null;
        return;
      }
      const delta = targetProgress - currentProgress;
      currentProgress += Math.abs(delta) < 0.001 ? delta : delta * 0.24;
      material.uniforms.uProgress.value = currentProgress;
      renderer.render(scene, camera);

      if (!isReady) {
        isReady = true;
        readyRef.current(true);
      }

      if (Math.abs(targetProgress - currentProgress) >= 0.001) {
        frameId = requestAnimationFrame(render);
      } else {
        frameId = null;
      }
    };

    const scheduleRender = () => {
      if (active && frameId === null) frameId = requestAnimationFrame(render);
    };

    const updateScroll = () => {
      if (!supportsEffect.matches) {
        active = false;
        if (frameId !== null) {
          cancelAnimationFrame(frameId);
          frameId = null;
        }
        return;
      }

      const hostBounds = host.getBoundingClientRect();
      active = hostBounds.bottom > 0 && hostBounds.top < window.innerHeight;
      if (!active) {
        if (frameId !== null) {
          cancelAnimationFrame(frameId);
          frameId = null;
        }
        return;
      }

      const heroScene = host.closest('.hero-scene');
      if (!heroScene) return;
      const bounds = heroScene.getBoundingClientRect();
      const sceneTop = bounds.top + window.scrollY;
      const scrollableDistance = Math.max(1, bounds.height - window.innerHeight);
      targetProgress = THREE.MathUtils.clamp(
        (window.scrollY - sceneTop) / scrollableDistance,
        0,
        1
      );
      scheduleRender();
    };

    const resize = () => {
      const { width, height } = host.getBoundingClientRect();
      if (width < 1 || height < 1) return;
      const dimensionsChanged = width !== lastWidth || height !== lastHeight;
      lastWidth = width;
      lastHeight = height;
      if (dimensionsChanged) renderer.setSize(width, height, false);

      const distance = Math.max(width, height) * 2.2;
      camera.aspect = width / height;
      camera.fov = THREE.MathUtils.radToDeg(2 * Math.atan(height / (2 * distance)));
      camera.position.set(0, 0, distance);
      camera.updateProjectionMatrix();

      if (material) material.uniforms.uSize.value.set(width, height);
      if (texture) {
        const columns = Math.max(
          24,
          Math.round(width / (window.innerWidth < 700 ? 12 : 8))
        );
        const rows = Math.max(32, Math.round(columns * (height / width)));
        const newGeometry = createShardGeometry(
          columns,
          rows,
          (texture.image as HTMLImageElement).naturalWidth /
            (texture.image as HTMLImageElement).naturalHeight,
          width / height
        );
        if (mesh) {
          mesh.geometry.dispose();
          mesh.geometry = newGeometry;
        } else if (material) {
          mesh = new THREE.Mesh(newGeometry, material);
          scene.add(mesh);
        }
        geometry = newGeometry;
      }
      updateScroll();
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);

    const onContextLost = (event: Event) => {
      event.preventDefault();
      isReady = false;
      active = false;
      if (frameId !== null) {
        cancelAnimationFrame(frameId);
        frameId = null;
      }
      readyRef.current(false);
    };
    const onContextRestored = () => {
      active = true;
      resize();
      updateScroll();
    };
    const onMediaChange = () => {
      if (!supportsEffect.matches) {
        readyRef.current(false);
        updateScroll();
      } else {
        updateScroll();
      }
    };

    renderer.domElement.addEventListener('webglcontextlost', onContextLost);
    renderer.domElement.addEventListener('webglcontextrestored', onContextRestored);
    supportsEffect.addEventListener('change', onMediaChange);
    window.addEventListener('scroll', updateScroll, { passive: true });
    window.addEventListener('resize', resize, { passive: true });

    textureLoader.load(
      imageUrl,
      (loadedTexture) => {
        if (disposed) {
          loadedTexture.dispose();
          return;
        }
        texture = loadedTexture;
        texture.colorSpace = THREE.SRGBColorSpace;
        material = new THREE.ShaderMaterial({
          uniforms: {
            uMap: { value: texture },
            uSize: { value: new THREE.Vector2(1, 1) },
            uProgress: { value: 0 },
          },
          vertexShader: `
            attribute vec3 aCenter;
            attribute vec3 aDirection;
            attribute float aSeed;
            attribute float aStart;
            attribute vec3 aBarycentric;
            uniform vec2 uSize;
            uniform float uProgress;
            varying vec2 vUv;
            varying vec3 vBarycentric;
            varying float vCrack;
            varying float vShard;
            varying float vSeed;
            varying float vVisibility;
            void main() {
              float spread = smoothstep(aStart, min(aStart + 0.32, 0.98), uProgress);
              vec2 center = aCenter.xy * uSize;
              vec2 local = (position.xy - aCenter.xy) * uSize;
              float angle = aSeed * 1.7 * spread;
              float sine = sin(angle);
              float cosine = cos(angle);
              vec2 rotated = vec2(
                local.x * cosine - local.y * sine,
                local.x * sine + local.y * cosine
              );
              float travel = spread * max(uSize.x, uSize.y) * 0.3;
              vec3 displaced = vec3(
                center + rotated + aDirection.xy * travel,
                aDirection.z * travel
              );
              float fade = smoothstep(0.77 + aStart * 0.12, 1.0, uProgress);
              vVisibility = 1.0 - fade;
              vCrack = smoothstep(0.08, 0.18, uProgress) *
                (1.0 - smoothstep(0.22, 0.42, uProgress));
              vShard = smoothstep(0.12, 0.36, uProgress) *
                (1.0 - smoothstep(0.84, 1.0, uProgress));
              vSeed = aSeed;
              vUv = uv;
              vBarycentric = aBarycentric;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
            }
          `,
          fragmentShader: `
            uniform sampler2D uMap;
            varying vec2 vUv;
            varying vec3 vBarycentric;
            varying float vCrack;
            varying float vShard;
            varying float vSeed;
            varying float vVisibility;
            void main() {
              vec4 photo = texture2D(uMap, vUv);
              float edge = 1.0 - smoothstep(0.0, 0.035,
                min(vBarycentric.x, min(vBarycentric.y, vBarycentric.z)));
              vec3 crackColor = mix(vec3(0.055, 0.075, 0.09), vec3(0.28, 0.49, 0.58), 0.24);
              photo.rgb = mix(photo.rgb, crackColor, edge * vCrack * 0.72);
              float glint = edge * vShard * (0.04 + 0.25 * step(0.9, fract(vSeed * 17.13)));
              photo.rgb += vec3(0.23, 0.33, 0.38) * glint;
              gl_FragColor = vec4(photo.rgb, photo.a * vVisibility);
              #include <tonemapping_fragment>
              #include <colorspace_fragment>
            }
          `,
          transparent: true,
          side: THREE.DoubleSide,
          depthTest: false,
          depthWrite: false,
          toneMapped: false,
        });

        resize();
        if (!geometry) return;
        material.uniforms.uSize.value.set(lastWidth, lastHeight);
        if (!mesh) {
          mesh = new THREE.Mesh(geometry, material);
          scene.add(mesh);
        }
        scheduleRender();
      },
      undefined,
      (error) => {
        console.warn('Crystalline portrait texture failed; showing the original photo.', error);
      }
    );

    return () => {
      disposed = true;
      if (frameId !== null) cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      window.removeEventListener('scroll', updateScroll);
      window.removeEventListener('resize', resize);
      supportsEffect.removeEventListener('change', onMediaChange);
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', onContextRestored);
      geometry?.dispose();
      material?.dispose();
      texture?.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [enabled, imageUrl]);

  if (!enabled) return null;
  return <div ref={hostRef} className="portrait-effect-canvas" aria-hidden="true" />;
}
