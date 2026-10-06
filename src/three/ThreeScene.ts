/**
 * ThreeScene.ts - Procedural 3D World Engine ("TAFADZWA.OS")
 * 
 * High-performance continuous WebGL scene with procedural geometries,
 * spline camera choreography, interactive raycasting, and wireframe morphing.
 */

import * as THREE from 'three';
import { QualityTier } from '../types/index.ts';
import { PROJECTS, LAB_EXPERIMENTS, SKILL_CONSTELLATION } from '../data/portfolioData.ts';

export interface SceneCallbacks {
  onSelectProject: (projectId: string) => void;
  onSelectLab: (labId: string) => void;
  onSelectSkill: (skillId: string) => void;
  onHoverObject: (title: string | null) => void;
  onSelectAmbientObject?: (title: string, detail: string) => void;
  onScrollProgressUpdate?: (progress: number) => void;
}

interface StarLayer {
  points: THREE.Points;
  speed: number;
  baseOpacity: number;
  baseColor: THREE.Color;
}

interface InteractiveMesh {
  mesh: THREE.Object3D;
  type: 'project' | 'lab' | 'skill';
  id: string;
  title: string;
  baseScale: THREE.Vector3;
  basePosition: THREE.Vector3;
  rotationSpeed?: THREE.Vector3;
  floatAmplitude?: number;
  floatPhase?: number;
  hoverScale?: number;
  motionRoot?: THREE.Group;
  orbitRing?: THREE.Mesh;
  orbitMoon?: THREE.Mesh;
  orbitRadius?: number;
}

interface FloatingTechnologyObject {
  id: string;
  title: string;
  detail: string;
  mesh: THREE.Group;
  basePosition: THREE.Vector3;
  baseRotation: THREE.Euler;
  baseScale: THREE.Vector3;
  velocity: THREE.Vector3;
  rotationVelocity: THREE.Vector3;
  materials: THREE.MeshStandardMaterial[];
  baseEmissiveIntensities: number[];
  interactionRadius: number;
  floatAmplitude: number;
  phase: number;
  hitGlow: number;
}

type SectionAtmosphere = 'hero' | 'about' | 'projects' | 'explainai' | 'kazilink' | 'lab' | 'contact';

export class ThreeScene {
  private container: HTMLElement;
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private clock: THREE.Timer;
  private animationFrameId: number | null = null;
  private lastFrameTimestamp = 0;
  private callbacks: SceneCallbacks;
  private reducedMotionQuery!: MediaQueryList;
  private prefersReducedMotion = false;
  private isMinimalScene = false;
  private isLowPowerDevice = false;
  private hoveredTitle: string | null = null;
  private pointerOverCanvas = false;
  private sectionObserver: IntersectionObserver | null = null;
  private observedSections = new Map<Element, { atmosphere: SectionAtmosphere; ratio: number }>();
  private lastScrollY = 0;
  private lastScrollTime = 0;
  private targetScrollVelocity = 0;
  private smoothScrollVelocity = 0;

  // Render & Quality state
  private quality: QualityTier = 'high';
  private isWireframe = false;
  private mouse = new THREE.Vector2(0, 0);
  private targetMouse = new THREE.Vector2(0, 0);
  private raycaster = new THREE.Raycaster();
  private scrollProgress = 0;
  private targetScrollProgress = 0;
  private starLayers: StarLayer[] = [];
  private farStarGroup = new THREE.Group();
  private midStarGroup = new THREE.Group();
  private nearStarGroup = new THREE.Group();
  private streakMaterials: THREE.LineBasicMaterial[] = [];
  private explainNetworkLineMaterial?: THREE.LineBasicMaterial;
  private explainNetworkPointMaterial?: THREE.PointsMaterial;
  private kaziNetworkLineMaterial?: THREE.LineBasicMaterial;
  private kaziNetworkPointMaterial?: THREE.PointsMaterial;
  private targetAtmosphere = { warm: 0, technical: 0, network: 0, explain: 0, kazi: 0, energy: 0, calm: 1 };
  private currentAtmosphere = { warm: 0, technical: 0, network: 0, explain: 0, kazi: 0, energy: 0, calm: 1 };
  private explainNetworkGroup?: THREE.Group;
  private kaziNetworkGroup?: THREE.Group;
  private atmosphereTint = new THREE.Color(0xe1ddd4);
  private projectPlanets: THREE.Group[] = [];
  private starHoverIndicator?: THREE.Group;
  private starHoverRings: THREE.Mesh[] = [];
  private floatingTechnologyObjects: FloatingTechnologyObject[] = [];
  private hoveredTechnologyObject: FloatingTechnologyObject | null = null;

  // Scene Objects & Groups
  private mainGroup = new THREE.Group();
  private particlesMesh!: THREE.Points;
  private particlePositions!: Float32Array;
  private particleBasePositions!: Float32Array;
  private gridHelper!: THREE.GridHelper;
  private interactiveMeshes: InteractiveMesh[] = [];

  // Constellation lines & stars
  private constellationGroup = new THREE.Group();
  private aiEngineeringGroup = new THREE.Group();
  private explainAiGroup = new THREE.Group();
  private kaziLinkGroup = new THREE.Group();
  private cryptoTerrainGroup = new THREE.Group();

  // Camera Path Points (9 Acts continuous spline)
  private cameraSpline!: THREE.CatmullRomCurve3;
  private lookTargetSpline!: THREE.CatmullRomCurve3;
  private activeTargetOverride: THREE.Vector3 | null = null;
  private activeCamPosOverride: THREE.Vector3 | null = null;

  constructor(container: HTMLElement, callbacks: SceneCallbacks, initialQuality: QualityTier = 'high') {
    this.container = container;
    this.callbacks = callbacks;
    this.quality = initialQuality;
    this.clock = new THREE.Timer();
    this.clock.connect(document);
    this.reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.prefersReducedMotion = this.reducedMotionQuery.matches;
    this.isLowPowerDevice =
      typeof navigator.hardwareConcurrency === 'number' && navigator.hardwareConcurrency <= 4;
    this.isMinimalScene =
      this.prefersReducedMotion ||
      window.matchMedia('(max-width: 767px)').matches;
    if (this.isMinimalScene || this.isLowPowerDevice) this.quality = 'low';
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    this.scrollProgress = maxScroll > 0 ? THREE.MathUtils.clamp(window.scrollY / maxScroll, 0, 1) : 0;
    this.targetScrollProgress = this.scrollProgress;

    this.initRenderer();
    this.initCameraAndSplines();
    this.initLightingAndAtmosphere();
    this.buildWorld();
    this.buildCinematicStarfield();
    this.buildProjectPlanets();
    this.buildCandlestickProjectMarker();
    this.buildFloatingTechnologyObjects();
    this.attachEventListeners();
    this.scheduleFrame();
  }

  private initRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      antialias: this.quality !== 'low',
      alpha: false,
      powerPreference: 'high-performance',
      stencil: false,
      depth: true,
    });

    const dprMap = { high: Math.min(window.devicePixelRatio, 1.5), medium: 1, low: 0.75 };
    this.renderer.setPixelRatio(dprMap[this.quality]);
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setClearColor(0x171819, 1);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.9;
    this.container.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x171819);
    this.scene.fog = new THREE.FogExp2(0x202122, 0.009);
  }

  private initCameraAndSplines() {
    const aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(52, aspect, 0.1, 350);

    // 9-Act Camera Spline Waypoints (Z flows from 30 down into negative space)
    const camPoints = [
      new THREE.Vector3(0, 4, 32),    // Act 0 / Boot & Hero ignite
      new THREE.Vector3(0, 1.5, 20),  // Act 1 / Hero Typographic Core
      new THREE.Vector3(-3, 0.5, 6),  // Act 2 / ExplainAI Pipeline
      new THREE.Vector3(3.5, 0.5, -8),// Act 2 / KaziLink Ecosystem
      new THREE.Vector3(0, 1.8, -22), // Act 2 / Crypto Predictor Terrain
      new THREE.Vector3(-4, 2, -36),  // Act 3 / The Lab Chamber
      new THREE.Vector3(0, 3, -52),   // Act 4 / AI Engineering Architecture
      new THREE.Vector3(3, 4, -68),   // Act 5 / Stack Constellation
      new THREE.Vector3(0, 1.5, -84), // Act 6 / How I Build Lit Track
      new THREE.Vector3(-2, 2, -98),  // Act 7 / Designing Experience
      new THREE.Vector3(0, 2, -112),  // Act 8 / About + Currently Building
      new THREE.Vector3(0, 3, -128),  // Act 9 / Contact & Resolution
    ];

    const lookPoints = [
      new THREE.Vector3(0, 1, 10),
      new THREE.Vector3(0, 0.5, 0),
      new THREE.Vector3(-1.5, 0.2, 0),
      new THREE.Vector3(2, 0, -14),
      new THREE.Vector3(0, 0.5, -30),
      new THREE.Vector3(-2, 1.5, -42),
      new THREE.Vector3(0, 2, -58),
      new THREE.Vector3(1, 2.5, -74),
      new THREE.Vector3(0, 0.8, -90),
      new THREE.Vector3(-1, 1.5, -104),
      new THREE.Vector3(0, 1.5, -118),
      new THREE.Vector3(0, 1, -136),
    ];

    this.cameraSpline = new THREE.CatmullRomCurve3(camPoints);
    this.lookTargetSpline = new THREE.CatmullRomCurve3(lookPoints);

    // Initial position
    this.camera.position.copy(camPoints[0]);
    this.camera.lookAt(lookPoints[0]);
    this.scene.add(this.camera);
  }

  private initLightingAndAtmosphere() {
    // Soft neutral light keeps the scene atmospheric without the neon look.
    const ambientLight = new THREE.AmbientLight(0x77766f, 0.9);
    this.scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xd8d5cc, 1.1);
    keyLight.position.set(10, 25, 20);
    this.scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xbab8b1, 0.4);
    rimLight.position.set(-15, -10, -30);
    this.scene.add(rimLight);

    this.gridHelper = new THREE.GridHelper(300, 120, 0x77766f, 0x343536);
    this.gridHelper.position.y = -3;
    (this.gridHelper.material as THREE.Material).transparent = true;
    (this.gridHelper.material as THREE.Material).opacity = 0.1;
    this.scene.add(this.gridHelper);
  }

  private buildWorld() {
    this.scene.add(this.mainGroup);

    this.buildParticleField();
    if (this.isMinimalScene) return;

    this.buildExplainAiPipeline();
    this.buildKaziLinkCity();
  }

  // --- ACT 1: Particle Field ---
  private buildParticleField() {
    const particleCount = this.isMinimalScene
      ? 32
      : this.quality === 'high'
        ? 260
        : this.quality === 'medium'
          ? 120
          : 48;
    const geometry = new THREE.BufferGeometry();
    this.particlePositions = new Float32Array(particleCount * 3);
    this.particleBasePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      const x = (Math.random() - 0.5) * 60;
      const y = (Math.random() - 0.5) * 30 + 3;
      const z = (Math.random() - 0.5) * 160 - 40;

      this.particlePositions[i] = x;
      this.particlePositions[i + 1] = y;
      this.particlePositions[i + 2] = z;

      this.particleBasePositions[i] = x;
      this.particleBasePositions[i + 1] = y;
      this.particleBasePositions[i + 2] = z;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(this.particlePositions, 3));

    const material = new THREE.PointsMaterial({
      color: 0xc8c6bf,
      size: 0.08,
      transparent: true,
      opacity: this.isMinimalScene ? 0.045 : 0.09,
    });

    this.particlesMesh = new THREE.Points(geometry, material);
    this.scene.add(this.particlesMesh);
  }

  private buildCinematicStarfield() {
    const farCount = this.isMinimalScene ? 900 : this.quality === 'high' ? 3000 : 1900;
    const midCount = this.isMinimalScene ? 210 : this.quality === 'high' ? 680 : 390;
    const nearCount = this.isMinimalScene ? 32 : this.quality === 'high' ? 96 : 56;

    this.addStarLayer(
      this.farStarGroup,
      farCount,
      0.2,
      this.isMinimalScene ? 1.4 : 1.8,
      this.isMinimalScene ? 0.28 : 0.37,
      220
    );
    this.addStarLayer(
      this.midStarGroup,
      midCount,
      0.55,
      this.isMinimalScene ? 2 : 2.6,
      this.isMinimalScene ? 0.4 : 0.52,
      180
    );
    this.addStarLayer(
      this.nearStarGroup,
      nearCount,
      1,
      this.isMinimalScene ? 2.8 : 3.8,
      this.isMinimalScene ? 0.56 : 0.72,
      100
    );
    this.scene.add(this.farStarGroup, this.midStarGroup, this.nearStarGroup);
    this.buildStarHoverIndicator();

    this.buildProjectNetwork(-1.5, 0.5, 0, 'explain');
    this.buildProjectNetwork(2.5, 0.5, -14, 'kazi');
    this.buildScrollStreaks();
  }

  private buildStarHoverIndicator() {
    const indicator = new THREE.Group();
    const core = new THREE.Mesh(
      new THREE.SphereGeometry(0.075, 12, 8),
      new THREE.MeshBasicMaterial({
        color: 0xfff4d7,
        transparent: true,
        depthTest: false,
        depthWrite: false,
      })
    );
    indicator.add(core);

    [0.2, 0.29].forEach((radius, index) => {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(radius, index === 0 ? 0.012 : 0.008, 5, 24),
        new THREE.MeshBasicMaterial({
          color: index === 0 ? 0xffe7b0 : 0xc5d8df,
          transparent: true,
          opacity: index === 0 ? 0.82 : 0.48,
          depthTest: false,
          depthWrite: false,
        })
      );
      ring.rotation.set(index === 0 ? 0.35 : 1.1, index * 0.7, index * 0.4);
      indicator.add(ring);
      this.starHoverRings.push(ring);
    });

    indicator.visible = false;
    this.starHoverIndicator = indicator;
    this.scene.add(indicator);
  }

  private buildProjectPlanets() {
    const projects = [
      { id: 'explainai', name: 'ExplainAI', color: 0xc5b99e, radius: 0.82 },
      { id: 'kazilink', name: 'KaziLink', color: 0x9eacb2, radius: 0.94 },
      {
        id: 'aws-compliance-checker',
        name: 'AWS Security Group Compliance Checker',
        color: 0xb9b5aa,
        radius: 0.78,
      },
    ];

    projects.forEach((project, index) => {
      const planet = new THREE.Group();
      const basePosition = new THREE.Vector3();

      const sphereGeometry = new THREE.SphereGeometry(project.radius, this.isMinimalScene ? 20 : 32, this.isMinimalScene ? 14 : 24);
      const sphereMaterial = new THREE.MeshStandardMaterial({
        color: project.color,
        roughness: 0.72,
        metalness: 0.18,
        emissive: project.color,
        emissiveIntensity: 0.12,
      });
      const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
      planet.add(sphere);

      const orbit = new THREE.Mesh(
        new THREE.TorusGeometry(project.radius * 1.48, 0.012, 6, 80),
        new THREE.MeshBasicMaterial({
          color: project.color,
          transparent: true,
          opacity: 0.42,
          depthWrite: false,
        })
      );
      orbit.rotation.set(0.86 + index * 0.15, 0.24, -0.2);
      planet.add(orbit);

      const equator = new THREE.Mesh(
        new THREE.TorusGeometry(project.radius * 1.28, 0.01, 5, 64),
        new THREE.MeshBasicMaterial({
          color: project.color,
          transparent: true,
          opacity: 0.34,
          depthWrite: false,
        })
      );
      equator.rotation.x = Math.PI / 2;
      planet.add(equator);

      const polarOrbit = new THREE.Mesh(
        new THREE.TorusGeometry(project.radius * 1.82, 0.008, 5, 72),
        new THREE.MeshBasicMaterial({
          color: project.color,
          transparent: true,
          opacity: 0.24,
          depthWrite: false,
        })
      );
      polarOrbit.rotation.set(1.18, 0.62 + index * 0.12, 0.35);
      planet.add(polarOrbit);

      const surfaceGrid = new THREE.Mesh(
        new THREE.SphereGeometry(project.radius * 1.012, 18, 12),
        new THREE.MeshBasicMaterial({
          color: project.color,
          wireframe: true,
          transparent: true,
          opacity: 0.12,
          depthWrite: false,
        })
      );
      planet.add(surfaceGrid);

      const moon = new THREE.Mesh(
        new THREE.SphereGeometry(project.radius * 0.13, 12, 10),
        new THREE.MeshBasicMaterial({ color: 0xe5e0d6 })
      );
      moon.position.set(project.radius * 1.55, project.radius * 0.54, 0);
      planet.add(moon);

      this.camera.add(planet);
      this.projectPlanets.push(planet);
      this.interactiveMeshes.push({
        mesh: planet,
        type: 'project',
        id: project.id,
        title: `${project.name} · floating project · click to inspect`,
        baseScale: new THREE.Vector3(1, 1, 1),
        basePosition,
        rotationSpeed: new THREE.Vector3(0.002, index % 2 === 0 ? 0.024 : -0.021, 0.001),
        floatAmplitude: this.isMinimalScene ? 0.3 : 0.55,
        floatPhase: index * 1.9,
        motionRoot: planet,
        orbitRing: orbit,
        orbitMoon: moon,
        orbitRadius: project.radius * 1.55,
        hoverScale: 1.65,
      });
    });
  }

  private buildCandlestickProjectMarker() {
    const candles = new THREE.Group();
    const candleScale = this.isMinimalScene ? 0.52 : 0.82;
    candles.scale.setScalar(candleScale);
    const candleCount = this.isMinimalScene ? 5 : 9;
    const candleWidth = this.isMinimalScene ? 0.22 : 0.28;
    const candleSpacing = this.isMinimalScene ? 0.48 : 0.58;
    const silhouette = [0.82, 1.35, 1.02, 1.7, 1.28, 1.92, 1.48, 2.08, 1.62];

    for (let i = 0; i < candleCount; i += 1) {
      const candle = new THREE.Group();
      const height = silhouette[i];
      const bullish = i % 3 !== 1;
      const tint = bullish ? 0xc6b99f : 0x8d999b;
      const material = new THREE.MeshStandardMaterial({
        color: tint,
        roughness: 0.58,
        metalness: 0.12,
        emissive: tint,
        emissiveIntensity: 0.08,
      });
      const body = new THREE.Mesh(
        new THREE.BoxGeometry(candleWidth, height * 0.34, candleWidth * 0.72),
        material
      );
      body.position.y = (bullish ? 1 : -1) * height * 0.08;
      candle.add(body);

      const wickMaterial = new THREE.MeshBasicMaterial({ color: 0xd9d4c7 });
      const wick = new THREE.Mesh(
        new THREE.CylinderGeometry(candleWidth * 0.035, candleWidth * 0.035, height, 5),
        wickMaterial
      );
      candle.add(wick);
      candle.position.set((i - (candleCount - 1) / 2) * candleSpacing, height * 0.47, 0);
      candles.add(candle);
    }

    const baseline = new THREE.Mesh(
      new THREE.BoxGeometry(candleCount * candleSpacing + 0.5, 0.018, 0.018),
      new THREE.MeshBasicMaterial({ color: 0xb9b4a8, transparent: true, opacity: 0.48 })
    );
    baseline.position.y = -0.1;
    candles.add(baseline);
    this.camera.add(candles);
    this.interactiveMeshes.push({
      mesh: candles,
      type: 'project',
      id: 'ai-crypto-predictor',
      title: 'Illustrative candlesticks · AI Crypto Predictor · click to inspect',
      baseScale: new THREE.Vector3(candleScale, candleScale, candleScale),
      basePosition: new THREE.Vector3(),
      rotationSpeed: new THREE.Vector3(0, 0.012, 0),
      floatAmplitude: this.isMinimalScene ? 0.12 : 0.28,
      floatPhase: 1.4,
      motionRoot: candles,
      hoverScale: 1.06,
    });
    this.layoutProjectMarkers();
  }

  private buildFloatingTechnologyObjects() {
    const addObject = (
      id: string,
      title: string,
      detail: string,
      position: THREE.Vector3,
      interactionRadius: number,
      phase: number,
      build: (
        group: THREE.Group,
        makeMaterial: (
          color: number,
          emissive?: number,
          emissiveIntensity?: number,
          metalness?: number,
          roughness?: number
        ) => THREE.MeshStandardMaterial,
        addMesh: (
          geometry: THREE.BufferGeometry,
          material: THREE.MeshStandardMaterial,
          at?: THREE.Vector3,
          rotation?: THREE.Euler
        ) => THREE.Mesh
      ) => void
    ) => {
      if (
        this.isMinimalScene &&
        !['astronaut', 'ai-brain', 'laptop', 'network'].includes(id)
      ) {
        return;
      }

      const group = new THREE.Group();
      const materials: THREE.MeshStandardMaterial[] = [];
      const makeMaterial = (
        color: number,
        emissive = color,
        emissiveIntensity = 0.08,
        metalness = 0.18,
        roughness = 0.62
      ) => {
        const material = new THREE.MeshStandardMaterial({
          color,
          emissive,
          emissiveIntensity,
          metalness,
          roughness,
        });
        materials.push(material);
        return material;
      };
      const addMesh = (
        geometry: THREE.BufferGeometry,
        material: THREE.MeshStandardMaterial,
        at = new THREE.Vector3(),
        rotation = new THREE.Euler()
      ) => {
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(at);
        mesh.rotation.copy(rotation);
        group.add(mesh);
        return mesh;
      };

      build(group, makeMaterial, addMesh);
      group.position.copy(position);
      const scale = this.isMinimalScene ? 0.78 : 1;
      group.scale.setScalar(scale);
      this.scene.add(group);
      this.floatingTechnologyObjects.push({
        id,
        title,
        detail,
        mesh: group,
        basePosition: position.clone(),
        baseRotation: group.rotation.clone(),
        baseScale: group.scale.clone(),
        velocity: new THREE.Vector3(),
        rotationVelocity: new THREE.Vector3(),
        materials,
        baseEmissiveIntensities: materials.map((material) => material.emissiveIntensity),
        interactionRadius,
        floatAmplitude: this.isMinimalScene ? 0.025 : 0.075,
        phase,
        hitGlow: 0,
      });
    };

    const sphere = (radius: number) =>
      new THREE.SphereGeometry(radius, this.isMinimalScene ? 12 : 20, this.isMinimalScene ? 8 : 14);
    const cylinder = (radiusTop: number, radiusBottom: number, height: number, segments = 12) =>
      new THREE.CylinderGeometry(
        radiusTop,
        radiusBottom,
        height,
        this.isMinimalScene ? 8 : segments
      );
    const addLimb = (
      addMesh: (
        geometry: THREE.BufferGeometry,
        material: THREE.MeshStandardMaterial,
        at?: THREE.Vector3,
        rotation?: THREE.Euler
      ) => THREE.Mesh,
      start: THREE.Vector3,
      end: THREE.Vector3,
      radius: number,
      material: THREE.MeshStandardMaterial
    ) => {
      const direction = end.clone().sub(start);
      const limb = addMesh(cylinder(radius, radius * 0.88, direction.length()), material);
      limb.position.copy(start).add(end).multiplyScalar(0.5);
      limb.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
    };

    addObject(
      'astronaut',
      'ASTRONAUT',
      'Curiosity · exploration · engineering',
      new THREE.Vector3(-7.1, 3.5, 13),
      0.22,
      0.4,
      (group, makeMaterial, addMesh) => {
        const suit = makeMaterial(0xd9d6ce, 0x7e8788, 0.025, 0.16, 0.78);
        const trim = makeMaterial(0x69757b, 0x223a43, 0.12, 0.56, 0.42);
        const visor = makeMaterial(0x80b8c1, 0x2e6973, 0.18, 0.72, 0.25);
        const accent = makeMaterial(0xd2b889, 0x7b643e, 0.12, 0.38, 0.46);
        addMesh(sphere(0.34), suit, new THREE.Vector3(0, -0.08, 0));
        addMesh(
          new THREE.BoxGeometry(0.42, 0.5, 0.22),
          trim,
          new THREE.Vector3(0, -0.12, -0.32)
        );
        addMesh(sphere(0.39), suit, new THREE.Vector3(0, 0.52, 0));
        addMesh(
          new THREE.SphereGeometry(0.29, this.isMinimalScene ? 12 : 18, 10),
          visor,
          new THREE.Vector3(0.02, 0.53, 0.28),
          new THREE.Euler(0.08, 0, 0)
        ).scale.set(1, 0.72, 0.42);
        addMesh(sphere(0.075), accent, new THREE.Vector3(0.22, -0.12, 0.2));
        addLimb(addMesh, new THREE.Vector3(-0.27, 0.08, 0), new THREE.Vector3(-0.55, -0.42, 0.03), 0.105, suit);
        addLimb(addMesh, new THREE.Vector3(0.27, 0.08, 0), new THREE.Vector3(0.54, -0.38, 0.04), 0.105, suit);
        addLimb(addMesh, new THREE.Vector3(-0.15, -0.34, 0), new THREE.Vector3(-0.23, -0.78, 0), 0.13, suit);
        addLimb(addMesh, new THREE.Vector3(0.15, -0.34, 0), new THREE.Vector3(0.23, -0.78, 0), 0.13, suit);
        addMesh(new THREE.BoxGeometry(0.18, 0.2, 0.08), accent, new THREE.Vector3(0, -0.08, 0.27));
        group.rotation.z = -0.12;
      }
    );

    addObject(
      'satellite',
      'SATELLITE',
      'Signals · systems · connected infrastructure',
      new THREE.Vector3(7.5, 3.3, 8),
      0.2,
      1.8,
      (group, makeMaterial, addMesh) => {
        const frame = makeMaterial(0xaeb7b7, 0x3b5156, 0.1, 0.68, 0.4);
        const panel = makeMaterial(0x527c8b, 0x315d70, 0.24, 0.72, 0.34);
        const gold = makeMaterial(0xc5a96f, 0x786038, 0.12, 0.48, 0.42);
        addMesh(new THREE.BoxGeometry(0.48, 0.42, 0.42), frame);
        addMesh(new THREE.BoxGeometry(0.88, 0.04, 0.62), panel, new THREE.Vector3(-0.76, 0, 0));
        addMesh(new THREE.BoxGeometry(0.88, 0.04, 0.62), panel, new THREE.Vector3(0.76, 0, 0));
        [-1.02, -0.5, 0.5, 1.02].forEach((x) =>
          addMesh(new THREE.BoxGeometry(0.018, 0.045, 0.62), gold, new THREE.Vector3(x, 0.025, 0))
        );
        addMesh(cylinder(0.018, 0.018, 0.54), gold, new THREE.Vector3(0, 0.42, 0));
        addMesh(sphere(0.12), gold, new THREE.Vector3(0, 0.7, 0));
        group.rotation.set(0.28, 0.4, -0.22);
      }
    );

    addObject(
      'ai-brain',
      'AI SYSTEMS',
      'Agentic workflows · AI APIs · intelligent systems',
      new THREE.Vector3(6.2, 1.3, -1),
      0.22,
      2.7,
      (group, makeMaterial, addMesh) => {
        const cortex = makeMaterial(0x9caeb0, 0x37646b, 0.13, 0.28, 0.48);
        const neural = makeMaterial(0x82c5c4, 0x29777c, 0.3, 0.38, 0.4);
        const center = makeMaterial(0xd1ba8a, 0x8a7348, 0.18, 0.32, 0.48);
        const lobes = [
          [-0.27, 0.15, 0], [-0.16, 0.34, 0.03], [-0.36, -0.06, 0.02],
          [0.27, 0.15, 0], [0.16, 0.34, 0.03], [0.36, -0.06, 0.02],
          [0, -0.18, 0],
        ];
        lobes.forEach(([x, y, z], index) => {
          const lobe = addMesh(sphere(index === 6 ? 0.25 : 0.24), cortex, new THREE.Vector3(x, y, z));
          lobe.scale.set(1, 0.88, 0.8);
        });
        addMesh(sphere(0.1), center, new THREE.Vector3(0, -0.02, 0.23));
        const linePoints = [
          new THREE.Vector3(-0.35, 0.15, 0.13),
          new THREE.Vector3(-0.13, 0.32, 0.12),
          new THREE.Vector3(0.08, 0.14, 0.2),
          new THREE.Vector3(0.33, 0.22, 0.12),
          new THREE.Vector3(0.22, -0.08, 0.15),
          new THREE.Vector3(-0.2, -0.14, 0.15),
        ];
        const networkGeometry = new THREE.BufferGeometry().setFromPoints(linePoints);
        const networkMaterial = new THREE.LineBasicMaterial({
          color: neural.color,
          transparent: true,
          opacity: 0.72,
          depthWrite: false,
        });
        group.add(new THREE.LineSegments(networkGeometry, networkMaterial));
        linePoints.forEach((point) => addMesh(sphere(0.035), neural, point));
        group.rotation.z = 0.15;
      }
    );

    addObject(
      'laptop',
      'FULL-STACK DEVELOPMENT',
      'Interfaces · APIs · dependable product engineering',
      new THREE.Vector3(-7.2, 0.4, -8),
      0.23,
      3.4,
      (group, makeMaterial, addMesh) => {
        const chassis = makeMaterial(0xaeb3b2, 0x424b4c, 0.1, 0.72, 0.38);
        const display = makeMaterial(0x18252b, 0x183c47, 0.18, 0.46, 0.32);
        const keyMaterial = makeMaterial(0x58656a, 0x23363c, 0.1, 0.44, 0.44);
        const code = makeMaterial(0x80c3bc, 0x276f6c, 0.32, 0.25, 0.4);
        addMesh(new THREE.BoxGeometry(1.25, 0.07, 0.82), chassis, new THREE.Vector3(0, -0.3, 0));
        addMesh(
          new THREE.BoxGeometry(1.18, 0.72, 0.065),
          chassis,
          new THREE.Vector3(0, 0.08, -0.38),
          new THREE.Euler(-0.16, 0, 0)
        );
        addMesh(
          new THREE.BoxGeometry(1.04, 0.58, 0.012),
          display,
          new THREE.Vector3(0, 0.09, -0.335),
          new THREE.Euler(-0.16, 0, 0)
        );
        for (let row = 0; row < 3; row += 1) {
          addMesh(
            new THREE.BoxGeometry(0.5 - row * 0.06, 0.018, 0.012),
            code,
            new THREE.Vector3(-0.23 + row * 0.03, 0.26 - row * 0.13, -0.323)
          );
        }
        for (let row = 0; row < 3; row += 1) {
          for (let column = 0; column < 7; column += 1) {
            addMesh(
              new THREE.BoxGeometry(0.09, 0.035, 0.012),
              keyMaterial,
              new THREE.Vector3(-0.48 + column * 0.16, -0.27, -0.08 + row * 0.13)
            );
          }
        }
        group.rotation.x = -0.12;
        group.rotation.y = 0.18;
      }
    );

    addObject(
      'network',
      'DISTRIBUTED SYSTEMS',
      'Services · resilient connections · data flow',
      new THREE.Vector3(-7.2, 1.8, -20),
      0.22,
      4.2,
      (group, makeMaterial, addMesh) => {
        const node = makeMaterial(0x95b7b4, 0x317773, 0.24, 0.35, 0.42);
        const hub = makeMaterial(0xd0b681, 0x8b7142, 0.18, 0.4, 0.4);
        const points = [
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(-0.74, 0.42, 0.02),
          new THREE.Vector3(0.7, 0.45, -0.06),
          new THREE.Vector3(-0.62, -0.48, -0.04),
          new THREE.Vector3(0.65, -0.42, 0.05),
          new THREE.Vector3(0, 0.88, -0.18),
        ];
        addMesh(sphere(0.23), hub, points[0]);
        points.slice(1).forEach((point, index) => addMesh(sphere(index === 4 ? 0.14 : 0.12), node, point));
        const links: number[] = [];
        points.slice(1).forEach((point) => {
          links.push(0, 0, 0, point.x, point.y, point.z);
        });
        const linkGeometry = new THREE.BufferGeometry();
        linkGeometry.setAttribute('position', new THREE.Float32BufferAttribute(links, 3));
        group.add(new THREE.LineSegments(
          linkGeometry,
          new THREE.LineBasicMaterial({ color: 0x7baba8, transparent: true, opacity: 0.6, depthWrite: false })
        ));
      }
    );

    addObject(
      'database',
      'DATA & BACKEND',
      'Structured data · persistence · reliable APIs',
      new THREE.Vector3(7.1, -0.8, -21),
      0.2,
      5.1,
      (group, makeMaterial, addMesh) => {
        const body = makeMaterial(0x71868a, 0x284d53, 0.16, 0.52, 0.4);
        const rim = makeMaterial(0xbca778, 0x76603b, 0.12, 0.54, 0.36);
        addMesh(cylinder(0.42, 0.42, 0.24, 20), body, new THREE.Vector3(0, 0.25, 0));
        addMesh(cylinder(0.42, 0.42, 0.24, 20), body, new THREE.Vector3(0, -0.02, 0));
        addMesh(cylinder(0.42, 0.42, 0.24, 20), body, new THREE.Vector3(0, -0.29, 0));
        [0.37, 0.1, -0.17].forEach((y) =>
          addMesh(
            new THREE.TorusGeometry(0.42, 0.022, 6, 24),
            rim,
            new THREE.Vector3(0, y, 0),
            new THREE.Euler(Math.PI / 2, 0, 0)
          )
        );
      }
    );

    addObject(
      'security-lock',
      'CYBERSECURITY',
      'Least privilege · secure infrastructure · compliance',
      new THREE.Vector3(-6.2, 1.1, -43),
      0.2,
      6.1,
      (group, makeMaterial, addMesh) => {
        const body = makeMaterial(0x78898a, 0x314f50, 0.13, 0.46, 0.44);
        const shackle = makeMaterial(0xb4a57f, 0x72603d, 0.13, 0.55, 0.36);
        addMesh(new THREE.BoxGeometry(0.82, 0.63, 0.22), body, new THREE.Vector3(0, -0.22, 0));
        addMesh(
          new THREE.TorusGeometry(0.28, 0.075, 8, 24, Math.PI),
          shackle,
          new THREE.Vector3(0, 0.23, -0.01),
          new THREE.Euler(0, 0, Math.PI)
        );
        addMesh(cylinder(0.06, 0.06, 0.17), shackle, new THREE.Vector3(0, -0.16, 0.13));
        addMesh(sphere(0.055), shackle, new THREE.Vector3(0, -0.05, 0.13));
      }
    );

    addObject(
      'terminal',
      'ENGINEERING LAB',
      'Build · test · observe · improve',
      new THREE.Vector3(7, 1.8, -58),
      0.2,
      7,
      (group, makeMaterial, addMesh) => {
        const frame = makeMaterial(0x8c9898, 0x3b5355, 0.13, 0.52, 0.42);
        const screen = makeMaterial(0x17252a, 0x153c3b, 0.22, 0.4, 0.3);
        const text = makeMaterial(0x85c5b5, 0x29766c, 0.35, 0.28, 0.42);
        addMesh(new THREE.BoxGeometry(1.25, 0.78, 0.1), frame);
        addMesh(new THREE.BoxGeometry(1.08, 0.61, 0.025), screen, new THREE.Vector3(0, 0, 0.065));
        for (let row = 0; row < 4; row += 1) {
          addMesh(
            new THREE.BoxGeometry(0.44 + (row % 2) * 0.2, 0.018, 0.012),
            text,
            new THREE.Vector3(-0.22, 0.18 - row * 0.11, 0.084)
          );
        }
        addMesh(new THREE.BoxGeometry(0.44, 0.07, 0.15), frame, new THREE.Vector3(0, -0.46, 0));
        group.rotation.y = -0.16;
      }
    );
  }

  private layoutProjectMarkers() {
    const halfWidthAtMarker = 22 * Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2)) * this.camera.aspect;
    const sideOffset = halfWidthAtMarker * 0.82;
    const positions = [
      new THREE.Vector3(sideOffset, 1.45, -22),
      new THREE.Vector3(-sideOffset, 0, -22),
      new THREE.Vector3(sideOffset, -1.45, -22),
    ];
    this.projectPlanets.forEach((planet, index) => {
      planet.position.copy(positions[index]);
      const interactive = this.interactiveMeshes.find((item) => item.mesh === planet);
      if (interactive) {
        interactive.basePosition.copy(positions[index]);
        const scale = this.isMinimalScene ? 0.78 : 1;
        planet.scale.setScalar(scale);
        interactive.baseScale.setScalar(scale);
      }
    });
    const candleMarker = this.interactiveMeshes.find((item) => item.id === 'ai-crypto-predictor');
    if (candleMarker) {
      candleMarker.mesh.position.set(-sideOffset * 0.7, -2.3, -16);
      candleMarker.basePosition.copy(candleMarker.mesh.position);
    }
  }

  private addStarLayer(
    group: THREE.Group,
    count: number,
    speed: number,
    size: number,
    opacity: number,
    depth: number
  ) {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      const offset = i * 3;
      const distance = 8 + Math.random() * depth;
      positions[offset] = (Math.random() - 0.5) * distance * 1.8 * this.camera.aspect;
      positions[offset + 1] = (Math.random() - 0.5) * distance * 1.2;
      positions[offset + 2] = -distance;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
      color: 0xd9d6ce,
      size,
      sizeAttenuation: false,
      transparent: true,
      opacity,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
      depthWrite: false,
    });
    const points = new THREE.Points(geometry, material);
    points.frustumCulled = false;
    group.add(points);
    this.starLayers.push({ points, speed, baseOpacity: opacity, baseColor: material.color.clone() });
  }

  private buildProjectNetwork(x: number, y: number, z: number, project: 'explain' | 'kazi') {
    const group = new THREE.Group();
    group.position.set(x, y, z);
    const nodeCount = this.isMinimalScene ? 6 : 10;
    const positions = new Float32Array(nodeCount * 3);
    const connections: number[] = [];

    for (let i = 0; i < nodeCount; i += 1) {
      const angle = (i / nodeCount) * Math.PI * 2;
      const radius = i % 2 === 0 ? 2.8 : 1.7;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = Math.sin(angle) * radius * 0.58;
      positions[i * 3 + 2] = Math.sin(angle * 2) * 0.8;
      const next = (i + 1) % nodeCount;
      connections.push(
        positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2],
        positions[next * 3], positions[next * 3 + 1], positions[next * 3 + 2]
      );
      if (i % 2 === 0) {
        const across = (i + nodeCount / 2) % nodeCount;
        connections.push(
          positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2],
          positions[across * 3], positions[across * 3 + 1], positions[across * 3 + 2]
        );
      }
    }

    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(connections, 3));
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0xc3c9c5,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    group.add(new THREE.LineSegments(lineGeometry, lineMaterial));

    const nodeGeometry = new THREE.BufferGeometry();
    nodeGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const nodeMaterial = new THREE.PointsMaterial({
      color: 0xe1ddd4,
      size: 0.13,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    group.add(new THREE.Points(nodeGeometry, nodeMaterial));
    this.scene.add(group);

    if (project === 'explain') {
      this.explainNetworkGroup = group;
      this.explainNetworkLineMaterial = lineMaterial;
      this.explainNetworkPointMaterial = nodeMaterial;
    } else {
      this.kaziNetworkGroup = group;
      this.kaziNetworkLineMaterial = lineMaterial;
      this.kaziNetworkPointMaterial = nodeMaterial;
    }
  }

  private buildScrollStreaks() {
    if (this.isMinimalScene || this.prefersReducedMotion) return;

    const count = this.quality === 'high' ? 5 : 3;
    for (let i = 0; i < count; i += 1) {
      const startX = (Math.random() - 0.5) * 22;
      const startY = (Math.random() - 0.5) * 10;
      const geometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(startX, startY, -18),
        new THREE.Vector3(startX + 1.25 + Math.random() * 1.5, startY - 0.08, -18),
      ]);
      const material = new THREE.LineBasicMaterial({
        color: 0xe2ded3,
        transparent: true,
        opacity: 0,
        depthWrite: false,
      });
      this.camera.add(new THREE.Line(geometry, material));
      this.streakMaterials.push(material);
    }
  }

  private observeSectionAtmosphere() {
    if (!('IntersectionObserver' in window)) return;
    const sectionAtmospheres: Record<string, SectionAtmosphere> = {
      home: 'hero',
      projects: 'projects',
      lab: 'lab',
      skills: 'lab',
      process: 'lab',
      about: 'about',
      contact: 'contact',
    };

    this.sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const element = entry.target;
        let atmosphere = sectionAtmospheres[element.id];
        if (element.classList.contains('story-project--explainai')) atmosphere = 'explainai';
        if (element.classList.contains('story-project--kazilink')) atmosphere = 'kazilink';
        if (!atmosphere) return;
        this.observedSections.set(element, { atmosphere, ratio: entry.intersectionRatio });
      });

      const selected = [...this.observedSections.entries()].reduce<{
        atmosphere: SectionAtmosphere;
        score: number;
      } | null>((best, [element, { atmosphere, ratio }]) => {
        if (ratio <= 0) return best;
        const score = ratio + (element.classList.contains('story-project') ? 0.45 : 0);
        return !best || score > best.score ? { atmosphere, score } : best;
      }, null);
      this.setAtmosphere(selected?.atmosphere ?? 'hero');
      this.scheduleFrame();
    }, { threshold: [0, 0.15, 0.35, 0.6] });

    const selectors = [
      '#home', '#projects', '#lab', '#skills', '#process', '#about', '#contact',
      '.story-project--explainai', '.story-project--kazilink',
    ];
    document.querySelectorAll(selectors.join(',')).forEach((element) => {
      this.sectionObserver?.observe(element);
    });
  }

  private setAtmosphere(atmosphere: SectionAtmosphere) {
    const profiles: Record<SectionAtmosphere, typeof this.targetAtmosphere> = {
      hero: { warm: 0, technical: 0, network: 0, explain: 0, kazi: 0, energy: 0, calm: 1 },
      about: { warm: 0.48, technical: 0, network: 0, explain: 0, kazi: 0, energy: 0.08, calm: 0.82 },
      projects: { warm: 0.04, technical: 0.18, network: 0.12, explain: 0, kazi: 0, energy: 0.3, calm: 0.5 },
      explainai: { warm: 0, technical: 0.52, network: 0.16, explain: 0.76, kazi: 0, energy: 0.38, calm: 0.42 },
      kazilink: { warm: 0.12, technical: 0.2, network: 0.16, explain: 0, kazi: 0.76, energy: 0.34, calm: 0.48 },
      lab: { warm: 0, technical: 0.58, network: 0.12, explain: 0, kazi: 0, energy: 0.2, calm: 0.68 },
      contact: { warm: 0.08, technical: 0, network: 0, explain: 0, kazi: 0, energy: 0, calm: 1 },
    };
    Object.assign(this.targetAtmosphere, profiles[atmosphere]);
  }

  // --- ACT 1: Hero Core ---
  private buildHeroCore() {
    const group = new THREE.Group();
    group.position.set(0, 1.2, 10);

    // Central pulsing icosahedron
    const coreGeo = new THREE.IcosahedronGeometry(1.6, 2);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0xaaa9a3,
      emissive: 0x383938,
      emissiveIntensity: 0.16,
      roughness: 0.48,
      metalness: 0.38,
      wireframe: this.isWireframe,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    group.add(coreMesh);

    // Orbiting rings
    for (let i = 0; i < 3; i++) {
      const ringGeo = new THREE.TorusGeometry(2.4 + i * 0.7, 0.025, 16, 100);
      const ringMat = new THREE.MeshBasicMaterial({
        color: i === 0 ? 0xb9b7af : i === 1 ? 0x8e8d87 : 0x6d6e6d,
        transparent: true,
        opacity: 0.28,
        wireframe: true,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / (2 + i * 0.5);
      ring.rotation.y = (i * Math.PI) / 3;
      group.add(ring);
    }

    this.mainGroup.add(group);

    this.interactiveMeshes.push({
      mesh: coreMesh,
      type: 'project',
      id: 'explainai',
      title: 'ExplainAI · Flagship Reasoner',
      baseScale: new THREE.Vector3(1, 1, 1),
      basePosition: group.position,
      rotationSpeed: new THREE.Vector3(0.005, 0.008, 0.003),
    });
  }

  // --- ACT 2: ExplainAI Pipeline (User Question -> Visual Explanation) ---
  private buildExplainAiPipeline() {
    this.explainAiGroup.position.set(-2, 0.5, 0);

    const stages = ['Question', 'Search decision', 'Source check', 'Answer'];

    const stagePositions: THREE.Vector3[] = [];
    const stageWidth = 2.0;

    stages.forEach((name, i) => {
      const center = (stages.length - 1) / 2;
      const pos = new THREE.Vector3((i - center) * stageWidth * 0.9, Math.sin(i * 0.6) * 0.2, (i - center) * -0.8);
      stagePositions.push(pos);

      // Station node platform
      const nodeGeo = new THREE.CylinderGeometry(0.5, 0.6, 0.15, 6);
      const nodeMat = new THREE.MeshStandardMaterial({
        color: 0x656664,
        emissive: 0x292a29,
        emissiveIntensity: 0.18,
        roughness: 0.52,
        metalness: 0.38,
        wireframe: this.isWireframe,
      });
      const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat);
      nodeMesh.position.copy(pos);
      this.explainAiGroup.add(nodeMesh);

      // Station floating crystal
      const crystalGeo = new THREE.OctahedronGeometry(0.3, 0);
      const crystalMat = new THREE.MeshStandardMaterial({
        color: 0xa9a79f,
        emissive: 0x454541,
        emissiveIntensity: 0.22,
        wireframe: this.isWireframe,
      });
      const crystal = new THREE.Mesh(crystalGeo, crystalMat);
      crystal.position.set(pos.x, pos.y + 0.5, pos.z);
      this.explainAiGroup.add(crystal);

      this.interactiveMeshes.push({
        mesh: crystal,
        type: 'project',
        id: 'explainai',
        title: `ExplainAI: Stage ${i + 1} (${name})`,
        baseScale: new THREE.Vector3(1, 1, 1),
        basePosition: crystal.position,
        rotationSpeed: new THREE.Vector3(0.01, 0.02, 0),
      });
    });

    // Connecting pipeline curve tube
    const curve = new THREE.CatmullRomCurve3(stagePositions);
    const tubeGeo = new THREE.TubeGeometry(curve, 64, 0.04, 8, false);
    const tubeMat = new THREE.MeshBasicMaterial({
      color: 0xa6a39b,
      transparent: true,
      opacity: 0.34,
      wireframe: true,
    });
    const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
    this.explainAiGroup.add(tubeMesh);

    this.mainGroup.add(this.explainAiGroup);
  }

  // --- ACT 2: KaziLink Floating Ecosystem City ---
  private buildKaziLinkCity() {
    this.kaziLinkGroup.position.set(2.5, 0.5, -14);

    // Floating cluster of geometric structures representing marketplace hubs
    const hubTypes = [
      { name: 'React application', pos: new THREE.Vector3(-1.4, 0, 0), color: 0x77766f },
      { name: 'Express API', pos: new THREE.Vector3(0, 0.35, -0.2), color: 0xaaa79f },
      { name: 'Supabase integration', pos: new THREE.Vector3(1.4, -0.1, -0.4), color: 0x85847e },
    ];

    const hubPositions: THREE.Vector3[] = [];

    hubTypes.forEach((hub) => {
      const geo = new THREE.BoxGeometry(0.7, 1.0, 0.7);
      const mat = new THREE.MeshStandardMaterial({
        color: hub.color,
        emissive: 0x252726,
        emissiveIntensity: 0.12,
        roughness: 0.48,
        metalness: 0.32,
        wireframe: this.isWireframe,
      });
      const building = new THREE.Mesh(geo, mat);
      building.position.copy(hub.pos);
      this.kaziLinkGroup.add(building);
      hubPositions.push(hub.pos);

      this.interactiveMeshes.push({
        mesh: building,
        type: 'project',
        id: 'kazilink',
        title: `KaziLink · ${hub.name}`,
        baseScale: new THREE.Vector3(1, 1, 1),
        basePosition: hub.pos,
        rotationSpeed: new THREE.Vector3(0.003, 0.005, 0),
      });
    });

    // Connecting laser lines between marketplace nodes
    const linesMat = new THREE.LineBasicMaterial({
      color: 0x767a79,
      transparent: true,
      opacity: 0.2,
    });
    const lineGeo = new THREE.BufferGeometry();
    const linePositions: number[] = [];
    for (let i = 0; i < hubPositions.length; i++) {
      for (let j = i + 1; j < hubPositions.length; j++) {
        linePositions.push(
          hubPositions[i].x, hubPositions[i].y, hubPositions[i].z,
          hubPositions[j].x, hubPositions[j].y, hubPositions[j].z
        );
      }
    }
    lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    const linesMesh = new THREE.LineSegments(lineGeo, linesMat);
    this.kaziLinkGroup.add(linesMesh);

    this.mainGroup.add(this.kaziLinkGroup);
  }

  // --- ACT 2: AI Crypto Predictor Candlestick Terrain ---
  private buildCryptoTerrain() {
    this.cryptoTerrainGroup.position.set(0, 0.5, -28);

    // 3D Candlestick terrain grid (wicks and body blocks)
    const count = 16;
    const spacing = 0.55;

    for (let i = 0; i < count; i++) {
      // Deterministic synthetic price wave for aesthetic visualization
      const wave = Math.sin(i * 0.45) * 0.9 + Math.cos(i * 0.8) * 0.5;
      const height = Math.max(0.3, Math.abs(wave) + 0.4);
      const isGreen = wave >= 0;

      // Candle body
      const bodyGeo = new THREE.BoxGeometry(0.32, height, 0.32);
      const bodyMat = new THREE.MeshStandardMaterial({
        color: isGreen ? 0x10b981 : 0xef4444,
        emissive: isGreen ? 0x059669 : 0xdc2626,
        emissiveIntensity: 0.7,
        roughness: 0.2,
        metalness: 0.7,
        wireframe: this.isWireframe,
      });
      const candle = new THREE.Mesh(bodyGeo, bodyMat);
      candle.position.set((i - count / 2) * spacing, height / 2, (Math.sin(i * 0.3) - 0.5) * 1.5);
      this.cryptoTerrainGroup.add(candle);

      // Upper & lower wick line
      const wickGeo = new THREE.CylinderGeometry(0.015, 0.015, height + 0.6, 6);
      const wickMat = new THREE.MeshBasicMaterial({
        color: isGreen ? 0x34d399 : 0xf87171,
      });
      const wick = new THREE.Mesh(wickGeo, wickMat);
      wick.position.copy(candle.position);
      this.cryptoTerrainGroup.add(wick);

      this.interactiveMeshes.push({
        mesh: candle,
        type: 'project',
        id: 'ai-crypto-predictor',
        title: `AI Crypto Predictor · Feature ${i + 1}`,
        baseScale: new THREE.Vector3(1, 1, 1),
        basePosition: candle.position,
      });
    }

    // Floating Decision Boundary Hyperplane
    const planeGeo = new THREE.PlaneGeometry(count * spacing + 1, 2.5);
    const planeMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.15,
      side: THREE.DoubleSide,
      wireframe: true,
    });
    const plane = new THREE.Mesh(planeGeo, planeMat);
    plane.rotation.x = Math.PI / 4;
    plane.position.set(0, 1.2, 0);
    this.cryptoTerrainGroup.add(plane);

    this.mainGroup.add(this.cryptoTerrainGroup);
  }

  // --- ACT 2: Orbiting Module Cards (Other Projects) ---
  private buildOrbitingModules() {
    const ringGroup = new THREE.Group();
    ringGroup.position.set(0, 1.5, -34);

    const otherProjects = PROJECTS.filter(
      (p) => !['explainai', 'kazilink', 'ai-crypto-predictor'].includes(p.id)
    );

    const radius = 5.5;
    otherProjects.forEach((proj, idx) => {
      const angle = (idx / otherProjects.length) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius * 0.6;
      const y = Math.sin(idx * 1.5) * 0.8;

      const cardGeo = new THREE.BoxGeometry(1.2, 0.8, 0.08);
      const cardMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(proj.accentColor),
        emissive: new THREE.Color(proj.accentColor),
        emissiveIntensity: 0.6,
        roughness: 0.25,
        metalness: 0.8,
        wireframe: this.isWireframe,
      });
      const cardMesh = new THREE.Mesh(cardGeo, cardMat);
      cardMesh.position.set(x, y, z);
      cardMesh.lookAt(0, y, 0);
      ringGroup.add(cardMesh);

      this.interactiveMeshes.push({
        mesh: cardMesh,
        type: 'project',
        id: proj.id,
        title: proj.title,
        baseScale: new THREE.Vector3(1, 1, 1),
        basePosition: new THREE.Vector3(x, y, z),
        rotationSpeed: new THREE.Vector3(0.002, 0.005, 0),
      });
    });

    this.mainGroup.add(ringGroup);
  }

  // --- ACT 3: The Lab Chamber ---
  private buildLabChamber() {
    const labGroup = new THREE.Group();
    labGroup.position.set(-2, 1.5, -42);

    const orbs = LAB_EXPERIMENTS;
    const radius = 3.6;

    orbs.forEach((orb, i) => {
      const angle = (i / orbs.length) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = Math.sin(i * 1.2) * 0.7;

      const geo = new THREE.DodecahedronGeometry(0.48, 1);
      const mat = new THREE.MeshStandardMaterial({
        color: 0x8b5cf6,
        emissive: 0x7c3aed,
        emissiveIntensity: 0.75,
        roughness: 0.15,
        metalness: 0.9,
        wireframe: this.isWireframe,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, y, z);
      labGroup.add(mesh);

      // Outer wire sphere aura
      const auraGeo = new THREE.SphereGeometry(0.68, 12, 12);
      const auraMat = new THREE.MeshBasicMaterial({
        color: 0xc4b5fd,
        wireframe: true,
        transparent: true,
        opacity: 0.35,
      });
      const aura = new THREE.Mesh(auraGeo, auraMat);
      aura.position.copy(mesh.position);
      labGroup.add(aura);

      this.interactiveMeshes.push({
        mesh,
        type: 'lab',
        id: orb.id,
        title: `Lab: ${orb.title}`,
        baseScale: new THREE.Vector3(1, 1, 1),
        basePosition: mesh.position,
        rotationSpeed: new THREE.Vector3(0.008, 0.012, 0.005),
      });
    });

    this.mainGroup.add(labGroup);
  }

  // --- ACT 4: AI Engineering System Diagram ---
  private buildAiEngineeringDiagram() {
    this.aiEngineeringGroup.position.set(0, 2, -58);

    const stages = [
      'Input & Guard',
      'Semantic Router',
      'Grounding & Context',
      'Agent / Model',
      'Deterministic Validation',
      'Contract Output',
      'UI Streaming',
    ];

    const count = stages.length;
    const spacing = 1.6;

    stages.forEach((name, idx) => {
      const x = (idx - count / 2) * spacing;
      const y = Math.sin(idx * 0.8) * 0.4;
      const z = (idx % 2 === 0 ? 0.3 : -0.3);

      const blockGeo = new THREE.BoxGeometry(0.9, 0.65, 0.3);
      const blockMat = new THREE.MeshStandardMaterial({
        color: 0x06b6d4,
        emissive: 0x0891b2,
        emissiveIntensity: 0.7,
        roughness: 0.2,
        metalness: 0.8,
        wireframe: this.isWireframe,
      });
      const block = new THREE.Mesh(blockGeo, blockMat);
      block.position.set(x, y, z);
      this.aiEngineeringGroup.add(block);

      this.interactiveMeshes.push({
        mesh: block,
        type: 'project',
        id: 'portfolio-os',
        title: `AI Architecture · ${name}`,
        baseScale: new THREE.Vector3(1, 1, 1),
        basePosition: block.position,
      });
    });

    // Connecting backbone line
    const points: THREE.Vector3[] = [];
    stages.forEach((_, idx) => {
      const x = (idx - count / 2) * spacing;
      const y = Math.sin(idx * 0.8) * 0.4;
      const z = (idx % 2 === 0 ? 0.3 : -0.3);
      points.push(new THREE.Vector3(x, y, z));
    });
    const lineCurve = new THREE.CatmullRomCurve3(points);
    const lineGeo = new THREE.TubeGeometry(lineCurve, 32, 0.025, 8, false);
    const lineMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, wireframe: true });
    this.aiEngineeringGroup.add(new THREE.Mesh(lineGeo, lineMat));

    this.mainGroup.add(this.aiEngineeringGroup);
  }

  // --- ACT 5: Stack Constellation ---
  private buildConstellation() {
    this.constellationGroup.position.set(1.5, 3.0, -74);

    const skills = SKILL_CONSTELLATION;
    const skillPositions: THREE.Vector3[] = [];

    skills.forEach((skill, idx) => {
      // Celestial spherical distribution grouped by category
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 2.8 + Math.random() * 1.5;

      const sinPhi = Math.sin(phi);
      const x = r * sinPhi * Math.cos(theta);
      const y = r * sinPhi * Math.sin(theta);
      const z = r * Math.cos(phi);

      const starGeo = new THREE.SphereGeometry(skill.proficiency === 'Core' ? 0.16 : 0.11, 12, 12);
      const starColor =
        skill.category === 'AI / ML'
          ? 0x06b6d4
          : skill.category === 'Engineering'
          ? 0x3b82f6
          : skill.category === 'Frontend'
          ? 0x8b5cf6
          : skill.category === 'Backend'
          ? 0x10b981
          : 0xf59e0b;

      const starMat = new THREE.MeshStandardMaterial({
        color: starColor,
        emissive: starColor,
        emissiveIntensity: 0.9,
        wireframe: this.isWireframe,
      });
      const star = new THREE.Mesh(starGeo, starMat);
      star.position.set(x, y, z);
      this.constellationGroup.add(star);
      skillPositions.push(new THREE.Vector3(x, y, z));

      this.interactiveMeshes.push({
        mesh: star,
        type: 'skill',
        id: skill.id,
        title: `${skill.name} (${skill.category})`,
        baseScale: new THREE.Vector3(1, 1, 1),
        basePosition: star.position,
      });
    });

    // Constellation connecting lines (stars in same cluster link)
    const linePositions: number[] = [];
    for (let i = 0; i < skillPositions.length; i++) {
      for (let j = i + 1; j < skillPositions.length; j++) {
        const dist = skillPositions[i].distanceTo(skillPositions[j]);
        if (dist < 2.0) {
          linePositions.push(
            skillPositions[i].x, skillPositions[i].y, skillPositions[i].z,
            skillPositions[j].x, skillPositions[j].y, skillPositions[j].z
          );
        }
      }
    }
    const constLineGeo = new THREE.BufferGeometry();
    constLineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    const constLineMat = new THREE.LineBasicMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.3,
    });
    this.constellationGroup.add(new THREE.LineSegments(constLineGeo, constLineMat));

    this.mainGroup.add(this.constellationGroup);
  }

  // --- ACT 6: Runway Track ---
  private buildRunwayTrack() {
    const trackGroup = new THREE.Group();
    trackGroup.position.set(0, 0.2, -90);

    // Glowing runway track rails
    for (let side = -1; side <= 1; side += 2) {
      const railGeo = new THREE.BoxGeometry(0.08, 0.08, 24);
      const railMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });
      const rail = new THREE.Mesh(railGeo, railMat);
      rail.position.set(side * 2.2, 0, 0);
      trackGroup.add(rail);
    }

    // Step beacons along runway
    for (let step = 0; step < 6; step++) {
      const beaconGeo = new THREE.ConeGeometry(0.25, 0.6, 4);
      const beaconMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 0.8,
        wireframe: this.isWireframe,
      });
      const beacon = new THREE.Mesh(beaconGeo, beaconMat);
      beacon.position.set(0, 0.4, (step - 2.5) * 3.6);
      trackGroup.add(beacon);
    }

    this.mainGroup.add(trackGroup);
  }

  // --- Event Handlers & Interaction ---
  private attachEventListeners() {
    window.addEventListener('resize', this.onResize);
    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('scroll', this.onScroll, { passive: true });
    this.reducedMotionQuery.addEventListener('change', this.onReducedMotionChange);
    document.addEventListener('visibilitychange', this.onVisibilityChange);
    this.observeSectionAtmosphere();
    this.lastScrollY = window.scrollY;
    this.lastScrollTime = performance.now();
    this.onScroll();

    // WebGL Context Lost recovery
    const canvas = this.renderer.domElement;
    canvas.addEventListener('click', this.onClick);
    canvas.addEventListener('webglcontextlost', this.onWebGLContextLost);
    canvas.addEventListener('webglcontextrestored', this.onWebGLContextRestored);
  }

  private onReducedMotionChange = (event: MediaQueryListEvent) => {
    this.prefersReducedMotion = event.matches;
    this.targetMouse.set(0, 0);
    this.targetScrollVelocity = 0;
    this.smoothScrollVelocity = 0;
    if (event.matches) this.targetScrollProgress = this.scrollProgress;
    this.clock.reset();
    this.scheduleFrame();
  };

  private onVisibilityChange = () => {
    if (document.hidden) {
      if (this.animationFrameId !== null) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      }
      return;
    }

    this.clock.reset();
    this.scheduleFrame();
  };

  private onResize = () => {
    if (!this.container) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    this.layoutProjectMarkers();
    this.scheduleFrame();
  };

  private onMouseMove = (e: MouseEvent) => {
    const rect = this.container.getBoundingClientRect();
    this.targetMouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.targetMouse.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    this.pointerOverCanvas = e.target === this.renderer.domElement;
    if (this.pointerOverCanvas) {
      this.mouse.copy(this.targetMouse);
    } else {
      this.mouse.set(2, 2);
    }
    this.scheduleFrame();
  };

  private onScroll = () => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    if (maxScroll <= 0) return;
    const currentY = window.scrollY;
    this.targetScrollProgress = THREE.MathUtils.clamp(currentY / maxScroll, 0, 1);
    const now = performance.now();
    const elapsedSeconds = (now - this.lastScrollTime) / 1000;
    if (!this.prefersReducedMotion && elapsedSeconds > 0.008) {
      this.targetScrollVelocity = THREE.MathUtils.clamp(
        ((currentY - this.lastScrollY) / Math.max(window.innerHeight, 1)) / elapsedSeconds,
        -2.4,
        2.4
      );
    }
    this.lastScrollY = currentY;
    this.lastScrollTime = now;

    this.callbacks.onScrollProgressUpdate?.(this.targetScrollProgress);
    this.scheduleFrame();
  };

  private onClick = (e: MouseEvent) => {
    const bounds = this.renderer.domElement.getBoundingClientRect();
    this.mouse.set(
      ((e.clientX - bounds.left) / bounds.width) * 2 - 1,
      -(((e.clientY - bounds.top) / bounds.height) * 2 - 1)
    );

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const ambientIntersections = this.raycaster.intersectObjects(
      this.floatingTechnologyObjects.map((item) => item.mesh),
      true
    );
    if (ambientIntersections.length > 0) {
      const hit = ambientIntersections[0];
      const item = this.findFloatingTechnologyObject(hit.object);
      if (item) {
        this.applyTechnologyObjectImpulse(item, hit.point);
        this.callbacks.onSelectAmbientObject?.(item.title, item.detail);
        this.scheduleFrame();
        return;
      }
    }

    // Raycast check on interactive 3D modules
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const meshes = this.interactiveMeshes.map((m) => m.mesh);
    const intersects = this.raycaster.intersectObjects(meshes, true);

    if (intersects.length > 0) {
      const hit = intersects[0].object;
      const target = this.findInteractiveTarget(hit);

      if (target) {
        if (target.type === 'project') {
          this.callbacks.onSelectProject(target.id);
        } else if (target.type === 'lab') {
          this.callbacks.onSelectLab(target.id);
        } else if (target.type === 'skill') {
          this.callbacks.onSelectSkill(target.id);
        }
      }
    }
  };

  private findFloatingTechnologyObject(object: THREE.Object3D) {
    return this.floatingTechnologyObjects.find((item) => {
      let current: THREE.Object3D | null = object;
      while (current) {
        if (current === item.mesh) return true;
        current = current.parent;
      }
      return false;
    });
  }

  private applyTechnologyObjectImpulse(item: FloatingTechnologyObject, hitPoint: THREE.Vector3) {
    const impulseDirection = item.mesh.position.clone().sub(hitPoint);
    if (impulseDirection.lengthSq() < 0.0001) {
      impulseDirection.copy(item.mesh.position).sub(this.camera.position);
    }
    impulseDirection.normalize();
    item.velocity.addScaledVector(impulseDirection, this.isMinimalScene ? 1.8 : 3.4);

    const spinAxis = impulseDirection.clone().cross(new THREE.Vector3(0, 1, 0));
    if (spinAxis.lengthSq() < 0.001) spinAxis.set(1, 0, 0);
    item.rotationVelocity.addScaledVector(
      spinAxis.normalize(),
      this.isMinimalScene ? 0.8 : 1.45
    );
    item.hitGlow = 1;
    this.scheduleFrame();
  }

  private findInteractiveTarget(object: THREE.Object3D): InteractiveMesh | undefined {
    return this.interactiveMeshes.find((item) => {
      let current: THREE.Object3D | null = object;
      while (current) {
        if (current === item.mesh) return true;
        current = current.parent;
      }
      return false;
    });
  }

  private onWebGLContextLost = (event: Event) => {
    event.preventDefault();
    console.warn('WebGL context lost; pausing the 3D scene.');
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  };

  private onWebGLContextRestored = () => {
    this.clock.reset();
    this.scheduleFrame();
  };

  private scheduleFrame() {
    if (document.hidden || this.animationFrameId !== null) return;
    this.animationFrameId = requestAnimationFrame(this.animate);
  }

  // --- Animation Loop ---
  private animate = (timestamp: number) => {
    this.animationFrameId = null;
    if (document.hidden) return;

    if (!this.prefersReducedMotion && timestamp - this.lastFrameTimestamp < 1000 / 60) {
      this.scheduleFrame();
      return;
    }
    this.lastFrameTimestamp = timestamp;

    this.clock.update(timestamp);
    const delta = Math.min(this.clock.getDelta(), 0.05);
    const frameScale = delta * 60;
    const time = this.clock.getElapsed();
    const smoothing = this.prefersReducedMotion ? 1 : 1 - Math.exp(-0.08 * frameScale);

    if (this.prefersReducedMotion) {
      this.mouse.set(0, 0);
    } else {
      this.mouse.lerp(this.targetMouse, smoothing);
      this.scrollProgress = THREE.MathUtils.lerp(this.scrollProgress, this.targetScrollProgress, smoothing);
      this.targetScrollVelocity *= Math.exp(-3.6 * delta);
      this.smoothScrollVelocity = THREE.MathUtils.lerp(
        this.smoothScrollVelocity,
        this.targetScrollVelocity,
        1 - Math.exp(-5 * delta)
      );
    }

    // 1. Camera Trajectory along Catmull-Rom Spline
    const pathT = THREE.MathUtils.clamp(this.scrollProgress, 0, 0.999);
    const splineCamPos = this.cameraSpline.getPoint(pathT);
    const splineLookAt = this.lookTargetSpline.getPoint(pathT);

    // Keep parallax subtle so the 3D scene stays behind the content.
    const parallaxX = this.prefersReducedMotion ? 0 : this.mouse.x * 0.18;
    const parallaxY = this.prefersReducedMotion ? 0 : this.mouse.y * 0.12;
    const velocityCameraShift = this.prefersReducedMotion
      ? 0
      : this.smoothScrollVelocity * (1 - this.currentAtmosphere.calm * 0.65);

    if (!this.activeCamPosOverride) {
      this.camera.position.x = THREE.MathUtils.lerp(this.camera.position.x, splineCamPos.x + parallaxX, smoothing);
      this.camera.position.y = THREE.MathUtils.lerp(
        this.camera.position.y,
        splineCamPos.y + parallaxY + velocityCameraShift * 0.018,
        smoothing
      );
      this.camera.position.z = THREE.MathUtils.lerp(
        this.camera.position.z,
        splineCamPos.z - velocityCameraShift * 0.045,
        smoothing
      );

      const lookTarget = new THREE.Vector3(
        splineLookAt.x + parallaxX * 0.4,
        splineLookAt.y + parallaxY * 0.4,
        splineLookAt.z
      );
      this.camera.lookAt(lookTarget);
      this.camera.rotation.z += velocityCameraShift * 0.0012;
    }

    this.currentAtmosphere.warm = THREE.MathUtils.lerp(this.currentAtmosphere.warm, this.targetAtmosphere.warm, smoothing);
    this.currentAtmosphere.technical = THREE.MathUtils.lerp(this.currentAtmosphere.technical, this.targetAtmosphere.technical, smoothing);
    this.currentAtmosphere.network = THREE.MathUtils.lerp(this.currentAtmosphere.network, this.targetAtmosphere.network, smoothing);
    this.currentAtmosphere.explain = THREE.MathUtils.lerp(this.currentAtmosphere.explain, this.targetAtmosphere.explain, smoothing);
    this.currentAtmosphere.kazi = THREE.MathUtils.lerp(this.currentAtmosphere.kazi, this.targetAtmosphere.kazi, smoothing);
    this.currentAtmosphere.energy = THREE.MathUtils.lerp(this.currentAtmosphere.energy, this.targetAtmosphere.energy, smoothing);
    this.currentAtmosphere.calm = THREE.MathUtils.lerp(this.currentAtmosphere.calm, this.targetAtmosphere.calm, smoothing);

    const speed = this.prefersReducedMotion
      ? 0
      : this.smoothScrollVelocity * (1 - this.currentAtmosphere.calm * 0.65);
    const progress = this.prefersReducedMotion ? 0 : this.scrollProgress;
    [
      { group: this.farStarGroup, speed: 0.2, drift: 0.12 },
      { group: this.midStarGroup, speed: 0.55, drift: 0.4 },
      { group: this.nearStarGroup, speed: 1, drift: 0.85 },
    ].forEach(({ group, speed: layerSpeed, drift }) => {
      group.position.copy(this.camera.position);
      group.position.y += progress * drift + speed * drift * 0.05;
      group.position.z -= progress * layerSpeed * 2;
      group.quaternion.copy(this.camera.quaternion);
      group.rotateZ(progress * layerSpeed * 0.012 + speed * layerSpeed * 0.003);
    });

    this.atmosphereTint.setRGB(
      0.86 + this.currentAtmosphere.warm * 0.045 - this.currentAtmosphere.technical * 0.025,
      0.85 + this.currentAtmosphere.warm * 0.02 + this.currentAtmosphere.technical * 0.015,
      0.81 + this.currentAtmosphere.technical * 0.065
    );
    const tintStrength = THREE.MathUtils.clamp(
      this.currentAtmosphere.warm * 0.34 + this.currentAtmosphere.technical * 0.12,
      0,
      0.2
    );
    this.starLayers.forEach(({ points, speed: layerSpeed, baseOpacity, baseColor }) => {
      const material = points.material as THREE.PointsMaterial;
      const twinkle = this.prefersReducedMotion ? 0 : Math.sin(time * (0.7 + layerSpeed) + layerSpeed * 11) * 0.035;
      material.opacity = baseOpacity * (1 + twinkle) *
        (1 + this.currentAtmosphere.energy * 0.34) *
        (1 - this.currentAtmosphere.calm * 0.12);
      material.color.lerpColors(baseColor, this.atmosphereTint, tintStrength);
      points.rotation.y = progress * layerSpeed * 0.003;
    });

    const explainIntensity = this.currentAtmosphere.explain * 0.085;
    const kaziIntensity = this.currentAtmosphere.kazi * 0.085;
    if (this.explainNetworkGroup) this.explainNetworkGroup.scale.setScalar(1 - this.currentAtmosphere.explain * 0.035);
    if (this.kaziNetworkGroup) this.kaziNetworkGroup.scale.setScalar(1 - this.currentAtmosphere.kazi * 0.035);
    if (this.explainNetworkLineMaterial) this.explainNetworkLineMaterial.opacity = explainIntensity;
    if (this.explainNetworkPointMaterial) this.explainNetworkPointMaterial.opacity = explainIntensity * 1.45;
    if (this.kaziNetworkLineMaterial) this.kaziNetworkLineMaterial.opacity = kaziIntensity;
    if (this.kaziNetworkPointMaterial) this.kaziNetworkPointMaterial.opacity = kaziIntensity * 1.45;
    const streakStrength = this.prefersReducedMotion
      ? 0
      : THREE.MathUtils.clamp((Math.abs(this.smoothScrollVelocity) - 0.35) / 2.05, 0, 1) *
        (1 - this.currentAtmosphere.calm * 0.78) * 0.085;
    this.streakMaterials.forEach((material, index) => {
      material.opacity = streakStrength * (index % 2 === 0 ? 1 : 0.65);
    });
    if (this.gridHelper) {
      (this.gridHelper.material as THREE.Material).opacity =
        0.025 + this.currentAtmosphere.technical * 0.035;
    }

    // 2. Rotate Interactive Meshes & Groups
    if (!this.prefersReducedMotion) {
      this.interactiveMeshes.forEach((item) => {
        if (item.floatAmplitude !== undefined) {
          const phase = item.floatPhase ?? 0;
          const motionRoot = item.motionRoot ?? item.mesh;
          motionRoot.position.x = item.basePosition.x + Math.sin(time * 0.62 + phase) * item.floatAmplitude * 0.72;
          motionRoot.position.y = item.basePosition.y + Math.sin(time * 0.9 + phase) * item.floatAmplitude;
          if (item.orbitRing) item.orbitRing.rotation.z = time * 0.48 + phase;
          if (item.orbitMoon && item.orbitRadius) {
            const moonAngle = time * 0.9 + phase;
            item.orbitMoon.position.set(
              Math.cos(moonAngle) * item.orbitRadius,
              Math.sin(moonAngle) * item.orbitRadius * 0.54,
              Math.sin(moonAngle * 0.5) * item.orbitRadius * 0.3
            );
          }
        }
        if (item.hoverScale !== undefined) {
          const targetScale = this.hoveredTitle === item.title ? item.hoverScale : 1;
          item.mesh.scale.lerp(item.baseScale.clone().multiplyScalar(targetScale), 1 - Math.exp(-5 * delta));
        }
        if (item.rotationSpeed) {
          item.mesh.rotation.x += item.rotationSpeed.x * frameScale * 0.5;
          item.mesh.rotation.y += item.rotationSpeed.y * frameScale * 0.5;
          item.mesh.rotation.z += item.rotationSpeed.z * frameScale * 0.5;
        }
      });

      this.floatingTechnologyObjects.forEach((item) => {
        const idleOffset = new THREE.Vector3(
          Math.sin(time * 0.28 + item.phase) * item.floatAmplitude * 0.35,
          Math.sin(time * 0.46 + item.phase) * item.floatAmplitude,
          0
        );
        const targetPosition = item.basePosition.clone().add(idleOffset);
        item.velocity.addScaledVector(
          targetPosition.sub(item.mesh.position),
          0.72 * delta
        );
        item.velocity.multiplyScalar(Math.exp(-1.8 * delta));
        item.mesh.position.addScaledVector(item.velocity, delta);

        const projected = item.mesh.position.clone().project(this.camera);
        const cursorDistance = Math.hypot(projected.x - this.mouse.x, projected.y - this.mouse.y);
        const cursorProximity =
          this.pointerOverCanvas && projected.z > -1 && projected.z < 1
            ? THREE.MathUtils.clamp(1 - cursorDistance / item.interactionRadius, 0, 1)
            : 0;
        const targetRotation = new THREE.Euler(
          item.baseRotation.x + cursorProximity * this.mouse.y * 0.1,
          item.baseRotation.y + Math.sin(time * 0.22 + item.phase) * 0.04 +
            cursorProximity * this.mouse.x * 0.12,
          item.baseRotation.z + Math.sin(time * 0.3 + item.phase) * 0.035
        );
        item.rotationVelocity.x += (targetRotation.x - item.mesh.rotation.x) * 0.8 * delta;
        item.rotationVelocity.y += (targetRotation.y - item.mesh.rotation.y) * 0.8 * delta;
        item.rotationVelocity.z += (targetRotation.z - item.mesh.rotation.z) * 0.8 * delta;
        item.rotationVelocity.multiplyScalar(Math.exp(-2.2 * delta));
        item.mesh.rotation.x += item.rotationVelocity.x * delta;
        item.mesh.rotation.y += item.rotationVelocity.y * delta;
        item.mesh.rotation.z += item.rotationVelocity.z * delta;
        item.hitGlow *= Math.exp(-2.4 * delta);

        const targetScale = item.baseScale.clone().multiplyScalar(
          1 + cursorProximity * 0.055 + item.hitGlow * 0.035
        );
        item.mesh.scale.lerp(targetScale, 1 - Math.exp(-5 * delta));
        item.materials.forEach((material, index) => {
          material.emissiveIntensity =
            item.baseEmissiveIntensities[index] + cursorProximity * 0.13 + item.hitGlow * 0.42;
        });
      });
    }

    // 3. Subtle Constellation Orbit Rotation
    if (this.constellationGroup) {
      this.constellationGroup.rotation.y = this.prefersReducedMotion ? 0 : time * 0.04;
    }

    // 4. Particle Field Wave Animation
    if (!this.prefersReducedMotion && this.particlesMesh && this.particlePositions) {
      const positions = this.particlePositions;
      const base = this.particleBasePositions;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] = base[i + 1] + Math.sin(time * 1.5 + base[i] * 0.1) * 0.08;
      }
      this.particlesMesh.geometry.attributes.position.needsUpdate = true;
    }

    // 5. Raycast Hover Check
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const meshes = this.interactiveMeshes.map((m) => m.mesh);
    const intersects = this.raycaster.intersectObjects(meshes, true);
    let hoveredTitle: string | null = null;
    if (intersects.length > 0) {
      const hit = intersects[0].object;
      const target = this.findInteractiveTarget(hit);
      hoveredTitle = target?.title ?? null;
    }
    this.hoveredTechnologyObject = null;
    if (!hoveredTitle && this.pointerOverCanvas && !this.prefersReducedMotion) {
      const ambientIntersections = this.raycaster.intersectObjects(
        this.floatingTechnologyObjects.map((item) => item.mesh),
        true
      );
      if (ambientIntersections.length > 0) {
        this.hoveredTechnologyObject = this.findFloatingTechnologyObject(
          ambientIntersections[0].object
        ) ?? null;
        hoveredTitle = this.hoveredTechnologyObject
          ? `${this.hoveredTechnologyObject.title} · click to interact`
          : null;
      }
    }
    if (hoveredTitle !== this.hoveredTitle) {
      this.hoveredTitle = hoveredTitle;
      this.callbacks.onHoverObject(hoveredTitle);
      document.body.style.cursor = hoveredTitle ? 'pointer' : 'default';
    }

    this.raycaster.params.Points.threshold = 2.5;
    const starIntersections = hoveredTitle || !this.pointerOverCanvas || this.prefersReducedMotion
      ? []
      : this.raycaster.intersectObjects(this.starLayers.map(({ points }) => points), false);
    const hoveredStar = starIntersections.find((intersection) => intersection.point);
    if (this.starHoverIndicator) {
      this.starHoverIndicator.visible = Boolean(hoveredStar) && !this.prefersReducedMotion;
      if (hoveredStar?.point) {
        this.starHoverIndicator.position.copy(hoveredStar.point);
        this.starHoverIndicator.quaternion.copy(this.camera.quaternion);
        const pulse = 1 + Math.sin(time * 5) * 0.12;
        this.starHoverIndicator.scale.setScalar(pulse);
        this.starHoverRings.forEach((ring, index) => {
          ring.rotation.z += (index === 0 ? 0.018 : -0.012) * frameScale;
        });
      }
    }

    this.renderer.render(this.scene, this.camera);

    if (!this.prefersReducedMotion) this.scheduleFrame();
  };

  // --- Public Controls & State Toggles ---
  public setQuality(quality: QualityTier) {
    this.quality = this.isMinimalScene || this.isLowPowerDevice ? 'low' : quality;
    const dprMap = { high: Math.min(window.devicePixelRatio, 1.5), medium: 1, low: 0.75 };
    this.renderer.setPixelRatio(dprMap[this.quality]);
    this.scheduleFrame();
  }

  public toggleWireframe(): boolean {
    this.isWireframe = !this.isWireframe;
    this.scene.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((m) => {
            if ('wireframe' in m) m.wireframe = this.isWireframe;
          });
        } else if ('wireframe' in mesh.material) {
          (mesh.material as THREE.MeshStandardMaterial).wireframe = this.isWireframe;
        }
      }
    });
    return this.isWireframe;
  }

  public flyToProgress(targetProgress: number) {
    this.targetScrollProgress = THREE.MathUtils.clamp(targetProgress, 0, 1);
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    if (maxScroll > 0) {
      window.scrollTo({
        top: this.targetScrollProgress * maxScroll,
        behavior: this.prefersReducedMotion ? 'auto' : 'smooth',
      });
    }
    this.scheduleFrame();
  }

  public destroy() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('scroll', this.onScroll);
    this.reducedMotionQuery.removeEventListener('change', this.onReducedMotionChange);
    document.removeEventListener('visibilitychange', this.onVisibilityChange);
    this.sectionObserver?.disconnect();
    this.sectionObserver = null;
    this.observedSections.clear();
    this.clock.dispose();
    document.body.style.cursor = 'default';

    if (this.renderer && this.renderer.domElement) {
      this.renderer.domElement.removeEventListener('click', this.onClick);
      this.renderer.domElement.removeEventListener('webglcontextlost', this.onWebGLContextLost);
      this.renderer.domElement.removeEventListener('webglcontextrestored', this.onWebGLContextRestored);
      this.scene.traverse((object) => {
        if ('geometry' in object && object.geometry instanceof THREE.BufferGeometry) {
          object.geometry.dispose();
        }
        if ('material' in object) {
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => {
            if (material instanceof THREE.Material) material.dispose();
          });
        }
      });
      this.renderer.domElement.remove();
      this.renderer.dispose();
    }
  }
}
