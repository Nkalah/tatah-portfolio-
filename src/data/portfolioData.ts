/** Typed portfolio content for Tafadzwa Nkala. */

export interface ProjectPipelineStage {
  id: string;
  name: string;
  role: string;
  description: string;
  tech: string;
}

export interface ProjectStoryStage {
  id: string;
  name: string;
  description: string;
}

export interface Project {
  id: string;
  title: string;
  tagline: string;
  category: 'Flagship AI' | 'Full-Stack Ecosystem' | 'Applied ML' | 'Cloud & Systems' | 'Computer Vision' | 'Web & Community';
  status: 'live' | 'experimental' | 'production' | 'completed';
  pingEndpoint?: string;
  liveUrl?: string;
  previewImage?: string;
  previewAlt?: string;
  githubUrl?: string;
  demoUrl?: string;
  featured: boolean;
  accentColor: string;
  summary: string;
  problem: string;
  whatIBuilt: string;
  myRole: string;
  architecture: string[];
  engineeringChallenge: string;
  whatILearned: string;
  builtWith: string[];
  whatThisDemonstrates: string;
  outcome?: string;
  proof: {
    liveLabel?: string;
    codeLabel?: string;
    metrics?: string;
  };
  pipelineStages?: ProjectPipelineStage[];
  storyStages?: ProjectStoryStage[];
  mlDetails?: {
    modelType: string;
    features: string[];
    validationMethod: string;
    honestDisclaimer: string;
  };
}

export interface LabExperiment {
  id: string;
  title: string;
  domain: string;
  tag: string;
  whatITried: string;
  whatWorked: string;
  whatFailed: string;
  whatILearned: string;
  wouldBuildNext: string;
  technologies: string[];
}

export interface SkillNode {
  id: string;
  name: string;
  category: 'AI / ML' | 'Engineering' | 'Frontend' | 'Backend' | 'Design & 3D' | 'Deployment';
  proficiency: 'Core' | 'Advanced' | 'Competent';
  projects: string[]; // project IDs that prove this skill
  description: string;
}

export const PORTFOLIO_OWNER = {
  name: 'Tafadzwa Nkala',
  identity: 'SOFTWARE ENGINEER · AI · PRODUCT',
  headline: 'Software Engineer building AI-powered products.',
  subline: 'I build AI-powered products and full-stack systems that turn complex ideas into useful software.',
  tag: 'CSE (AI specialization) · Full-Stack & AI Developer',
  lookingFor: 'Software Engineering, AI/ML, Full-Stack roles & high-impact internships',
  statusBadge: 'Open to Opportunities',
  location: 'Harare, Zimbabwe · Remote & Relocation Ready',
  timezone: 'CAT (UTC+2)',
  email: 'tatah.affiliates@gmail.com',
  links: {
    github: 'https://github.com/Nkalah',
    linkedin: 'https://linkedin.com/in/nkala',
    resume: '/resume.pdf',
    portfolioRepo: 'https://github.com/Nkalah',
  },
  philosophy: 'Build things. Break things. Understand why. Build better.',
};

export const FEATURED_PROJECT_IDS: readonly string[] = ['explainai', 'kazilink', 'aws-compliance-checker'];

export const PROJECTS: Project[] = [
  {
    id: 'explainai',
    title: 'ExplainAI',
    tagline: 'AI answer engine with search relevance checks',
    category: 'Flagship AI',
    status: 'completed',
    featured: true,
    accentColor: '#06b6d4', // cyan-500
    githubUrl: 'https://github.com/Nkalah/AI-Explainer',
    summary: 'An AI-powered answer engine that decides when to search the web, checks source relevance, and produces source-backed responses.',
    problem: 'AI answers can be difficult to trust when they are not grounded in relevant sources or rely on the model for deterministic tasks such as date calculations.',
    whatIBuilt: 'An answer flow that combines AI responses with explicit search decisions, source relevance checks, and programmatic date calculations.',
    myRole: 'Full-Stack Engineer — Built the answer experience and integrated the search and source-checking flow.',
    architecture: [
      'Question intake',
      'Search decision',
      'Web search and source relevance checks',
      'Programmatic date calculations',
      'Source-backed answer generation',
    ],
    engineeringChallenge: 'The repository emphasizes deciding when web search is useful and checking relevance before relying on external sources.',
    whatILearned: 'Date calculations are more reliable when handled with deterministic code rather than delegated to a language model.',
    builtWith: ['TypeScript', 'React', 'TanStack Start', 'Groq API'],
    whatThisDemonstrates: 'An AI answer flow that combines search decisions, source relevance checks, and generated responses.',
    outcome: 'The public repository describes source-backed answers with relevance-checked web search.',
    proof: {
      codeLabel: 'Public repository',
    },
    pipelineStages: [
      { id: 'p1', name: 'Question', role: 'Input', description: 'The user submits a question for the answer flow.', tech: 'React' },
      { id: 'p2', name: 'Search decision', role: 'Routing', description: 'The application determines whether a web search is needed.', tech: 'Application logic' },
      { id: 'p3', name: 'Source check', role: 'Validation', description: 'Search results are checked for relevance before use.', tech: 'Web search' },
      { id: 'p4', name: 'Answer', role: 'Output', description: 'The application returns an answer grounded in selected sources.', tech: 'Groq API' },
    ],
    storyStages: [
      { id: 'question', name: 'Question', description: 'The user submits a question to the answer flow.' },
      { id: 'search', name: 'Search decision', description: 'The application determines whether web search is useful for the question.' },
      { id: 'sources', name: 'Source check', description: 'Search results are checked for relevance before they are used.' },
      { id: 'answer', name: 'Answer', description: 'The response is generated using the selected source context.' },
    ],
  },
  {
    id: 'kazilink',
    title: 'KaziLink',
    tagline: 'Local marketplace connecting customers and service providers',
    category: 'Full-Stack Ecosystem',
    status: 'completed',
    featured: true,
    accentColor: '#3b82f6', // blue-500
    liveUrl: 'https://kazilink-local-marketplace.vercel.app/',
    previewImage: '/projects/kazilink-preview.png',
    previewAlt: 'KaziLink marketplace showing service search, local requests, and business listings.',
    githubUrl: 'https://github.com/Nkalah/kazilink-local-marketplace',
    summary: 'A local marketplace designed to connect customers, service providers, businesses, and property owners.',
    problem: 'Customers and local businesses need a way to find service providers, while providers need a place to present their services.',
    whatIBuilt: 'A marketplace application for connecting customers, service providers, businesses, and property owners.',
    myRole: 'Full-Stack Developer — Worked on the marketplace application and its server-side API.',
    architecture: [
      'React client application',
      'Node.js and Express server',
      'Supabase integration',
      'AI-assisted marketplace endpoints',
    ],
    engineeringChallenge: 'Keeping the marketplace experience and server-side endpoints aligned as the product grows.',
    whatILearned: 'A marketplace depends on clear flows for both the people looking for services and the people providing them.',
    builtWith: ['TypeScript', 'React', 'Node.js', 'Express', 'Supabase'],
    whatThisDemonstrates: 'A full-stack marketplace with server-side API routes and a managed data service.',
    outcome: 'The public repository describes a marketplace for customers, providers, businesses, and property owners.',
    proof: {
      codeLabel: 'Public repository',
    },
    storyStages: [
      { id: 'customers', name: 'Customers', description: 'People looking for local services use the marketplace to find providers.' },
      { id: 'marketplace', name: 'Marketplace', description: 'KaziLink brings customers, providers, businesses, and property owners into one application.' },
      { id: 'providers', name: 'Service providers', description: 'Providers and businesses can present services through the marketplace.' },
      { id: 'platform', name: 'Application stack', description: 'The repository lists a React client, a Node.js and Express server, and Supabase integration.' },
    ],
  },
  {
    id: 'ai-crypto-predictor',
    title: 'AI Crypto Predictor',
    tagline: 'Experimental Time-Series ML System & Candlestick Feature Pipeline',
    category: 'Applied ML',
    status: 'experimental',
    featured: false,
    accentColor: '#10b981', // emerald-500
    summary: 'An honest, transparent machine learning experiment exploring multi-feature technical indicators and Random Forest classification on cryptocurrency historical volatility.',
    problem: 'Online crypto trading tutorials make deceptive claims about predictive ML models. There is a severe lack of transparent, reproducible projects that document why markets are noisy and how statistical evaluation actually works.',
    whatIBuilt: 'An end-to-end Python/FastAPI ML pipeline: extracts raw Binance exchange ticks, calculates algorithmic indicators (RSI, MACD, Bollinger Bands, ATR), trains Random Forest models with walk-forward cross-validation, and provides interactive probability surfaces.',
    myRole: 'ML Engineer & Backend Developer — Data ingestion, stationary transformation, feature engineering, cross-validation tuning, and FastAPI inference server.',
    architecture: [
      'Data Ingestion: Binance Public REST/WebSocket API historical candle fetcher',
      'Feature Engineering: Custom vectorized Pandas/NumPy technical indicator transforms',
      'Stationarity Check: Augmented Dickey-Fuller tests to ensure valid time-series properties',
      'Model: Calibrated Random Forest Classifier with walk-forward rolling window validation',
      'Inference API: Lightweight FastAPI service returning probability distributions',
      'Visualization: Candlestick terrain rendering with dynamic decision boundary overlays',
    ],
    engineeringChallenge: 'Preventing look-ahead bias and data leakage during feature generation. Solved by implementing strict lagging on all rolling calculations and time-series split evaluation.',
    whatILearned: 'Financial time-series has a notoriously low signal-to-noise ratio. A model that achieves 54% directional accuracy after transaction fees is realistic, whereas models claiming 90% are always leaking future data.',
    builtWith: ['Python', 'scikit-learn', 'Pandas', 'NumPy', 'FastAPI', 'Three.js', 'Chart.js'],
    whatThisDemonstrates: 'Rigorous data engineering, mathematical feature derivation, honest scientific methodology, and avoidance of AI hype.',
    proof: {
      codeLabel: 'Jupyter notebooks + Python service',
    },
    mlDetails: {
      modelType: 'Calibrated Random Forest Ensemble (100 estimators, max depth 6)',
      features: ['14-period RSI', '12/26/9 MACD Signal Delta', 'Bollinger %B', 'Normalized Average True Range', 'Log Return Momentum'],
      validationMethod: 'Walk-Forward Rolling Cross-Validation (5 folds, no reshuffling)',
      honestDisclaimer: 'This system is strictly an academic demonstration of statistical feature engineering and time-series modeling. It does NOT forecast guaranteed profits and must never be used for live capital allocation.',
    },
  },
  {
    id: 'campusconnect',
    title: 'CampusConnect',
    tagline: 'Campus marketplace and community platform',
    category: 'Full-Stack Ecosystem',
    status: 'completed',
    featured: false,
    accentColor: '#8b5cf6', // purple-500
    liveUrl: 'https://campusconnect-india.vercel.app/',
    previewImage: '/projects/campusconnect-preview.png',
    previewAlt: 'CampusConnect homepage with campus updates, search, marketplace categories, and campus deals.',
    summary: 'A campus platform for browsing community updates, marketplace categories, and campus businesses.',
    problem: 'Students need a single place to discover campus activity, listings, and nearby businesses.',
    whatIBuilt: 'A campus marketplace interface with a community feed, searchable categories, and browsing for campus listings.',
    myRole: 'Full-Stack Engineer — Built the frontend React architecture, state management, and Node.js REST endpoints with MongoDB.',
    architecture: ['React 18', 'Tailwind CSS', 'Node.js Express', 'MongoDB Atlas', 'Socket.io for live notifications'],
    engineeringChallenge: 'Handling concurrent note edits and structured file upload storage with strict permission bounds by university department.',
    whatILearned: 'Component lifecycle optimization in React, full CRUD state hydration, and multi-user room scoping.',
    builtWith: ['React', 'Node.js', 'Express', 'MongoDB', 'Tailwind CSS', 'Socket.io'],
    whatThisDemonstrates: 'Fast user-centric full-stack development and practical community platform design.',
    proof: {
      codeLabel: 'Modular React + Express architecture',
    },
  },
  {
    id: 'aws-compliance-checker',
    title: 'AWS Security Group Compliance Checker',
    tagline: 'Rules-based review of AWS security group settings',
    category: 'Cloud & Systems',
    status: 'completed',
    featured: true,
    accentColor: '#f59e0b', // amber-500
    liveUrl: 'https://aws-security-group-compliance-check.vercel.app/',
    previewImage: '/projects/aws-checker-preview.png',
    previewAlt: 'AWS security group compliance dashboard with scan configuration, regions, and report actions.',
    githubUrl: 'https://github.com/Nkalah/Dev-ops-aws-security-group-compliance-checker-Tafadzwa',
    summary: 'A full-stack TypeScript application that scans AWS security groups and evaluates their rules against configurable security checks.',
    problem: 'Overly permissive security-group rules can expose services that should not be publicly reachable.',
    whatIBuilt: 'A compliance dashboard with AWS EC2 scanning, configurable rules, scoring, and report helpers.',
    myRole: 'Full-Stack Developer — Built the dashboard and the server-side AWS security-group scanning and compliance workflow.',
    architecture: ['TanStack Start', 'TypeScript', 'AWS SDK for JavaScript v3', 'Amazon EC2 API', 'Compliance rules and reporting'],
    engineeringChallenge: 'Keeping AWS credentials server-side while scanning security-group rules and producing useful findings.',
    whatILearned: 'Cloud security checks are easier to review when findings are tied to explicit, configurable rules.',
    builtWith: ['TypeScript', 'React', 'TanStack Start', 'AWS SDK v3', 'Amazon EC2'],
    whatThisDemonstrates: 'Server-side AWS API integration, explicit compliance rules, scoring, and reporting.',
    outcome: 'The public repository includes EC2 scanning functions, compliance rules, scoring, and report helpers.',
    proof: {
      codeLabel: 'Public repository',
    },
    storyStages: [
      { id: 'scan', name: 'EC2 scan', description: 'Server-side functions inspect AWS security group configuration.' },
      { id: 'rules', name: 'Compliance rules', description: 'Configurable checks are applied to security group rules.' },
      { id: 'score', name: 'Scoring', description: 'The checker scores the results of those rule evaluations.' },
      { id: 'report', name: 'Report', description: 'Report helpers present the review findings.' },
    ],
  },
  {
    id: 'drowsiness-detector',
    title: 'Computer Vision Drowsiness Detector',
    tagline: 'Real-Time Facial Landmark & Eye Aspect Ratio (EAR) Safety System',
    category: 'Computer Vision',
    status: 'completed',
    featured: false,
    accentColor: '#ef4444', // red-500
    summary: 'A computer vision safety system analyzing video webcam streams to detect driver fatigue via 68 facial landmark coordinates and Eye Aspect Ratio thresholds.',
    problem: 'Driver fatigue causes thousands of preventable transit accidents yearly. Expensive commercial monitoring hardware is out of reach for independent transport operators.',
    whatIBuilt: 'A lightweight Python OpenCV system that extracts eye landmarks, tracks consecutive blink duration, detects micro-sleep episodes, and triggers instantaneous audio alerts.',
    myRole: 'Computer Vision Developer — Implemented Euclidean landmark distance math, threshold tuning, and audio alert triggers.',
    architecture: ['OpenCV video capture', 'Dlib 68-point facial landmark predictor', 'Vectorized EAR math', 'Tkinter/Pygame alert audio'],
    engineeringChallenge: 'Maintaining 30+ FPS real-time processing on standard laptop CPUs without GPU acceleration while tolerating head rotation and lighting variance.',
    whatILearned: 'Geometric facial metrics (EAR and MAR math), temporal frame sliding windows to prevent false positives from natural blinking.',
    builtWith: ['Python', 'OpenCV', 'Dlib', 'NumPy', 'SciPy'],
    whatThisDemonstrates: 'Edge-capable computer vision, real-time signal processing, and life-safety engineering.',
    proof: {
      codeLabel: 'Fully reproducible with standard webcams',
    },
  },
  {
    id: 'kistos-pig-farm',
    title: "Kisto's Pig Farm Management",
    tagline: 'Agricultural ERP, Breeding Cycle & Livestock Inventory Platform',
    category: 'Web & Community',
    status: 'production',
    featured: false,
    accentColor: '#ec4899', // pink-500
    liveUrl: 'https://farm-snowy-delta.vercel.app/#',
    previewImage: '/projects/kistos-farm-preview.png',
    previewAlt: 'Kisto’s Pig Farm sign-in screen for its farm operations portal.',
    summary: 'A custom operational ERP built for a commercial livestock farm in Zimbabwe, digitizing gestation cycles, feed conversion ratios (FCR), medication schedules, and inventory.',
    problem: 'Farm operations relied on paper notebooks that got lost, resulting in missed farrowing dates, improper feed rationing, and delayed veterinary interventions.',
    whatIBuilt: 'A robust, mobile-optimized dashboard with visual gestation calendars, feed cost calculators, batch weight tracking, and automated vaccination alerts.',
    myRole: 'Solo Product Engineer — Conducted on-site user interviews with farm managers, built UI, designed database, and deployed to production.',
    architecture: ['Next.js React frontend', 'Supabase PostgreSQL database', 'Row Level Security', 'Tailwind CSS', 'Vercel edge deployment'],
    engineeringChallenge: 'Designing an interface that can be operated quickly with dirty hands or in bright outdoor sunlight on entry-level mobile phones.',
    whatILearned: 'Software is only as good as its real-world adoption. High contrast UI, giant touch targets (52px+), and instant feedback are vital for field software.',
    builtWith: ['React', 'Next.js', 'PostgreSQL', 'Tailwind CSS', 'TypeScript'],
    whatThisDemonstrates: 'Practical software engineering solving tangible physical business problems with measurable operational impact.',
    proof: {
      liveLabel: 'Live Client Deployment',
    },
  },
  {
    id: 'zimgo-logistics',
    title: 'ZimGo Transit & Route Planner',
    tagline: 'Offline-First Emerging Transit Routing & Parcel Waypoint Tracker',
    category: 'Full-Stack Ecosystem',
    status: 'experimental',
    featured: false,
    accentColor: '#14b8a6', // teal-500
    summary: 'A routing and waypoint estimation engine designed for informal urban bus/minibus transit lines lacking standardized GTFS schedule feeds.',
    problem: 'Informal transit routes in African cities have no published timetable feeds, causing unpredictability for commuters and parcel dispatchers.',
    whatIBuilt: 'A graph-based transit routing engine supporting dynamic waypoint stops, crowd-sourced fare schedules, and offline vector map tiles.',
    myRole: 'Full-Stack & Graph Routing Developer — Graph data structure implementation, Dijkstra shortest-path calculations, and mobile UI.',
    architecture: ['TypeScript Dijkstra pathfinder', 'Leaflet / OpenStreetMap tiles', 'ServiceWorker tile caching', 'Node.js Express backend'],
    engineeringChallenge: 'Generating accurate travel time estimates when road conditions and stop durations are highly stochastic.',
    whatILearned: 'Graph algorithms, topological sorting, and building offline-capable client mapping tools.',
    builtWith: ['TypeScript', 'Leaflet', 'Node.js', 'Express', 'PWA / CacheStorage'],
    whatThisDemonstrates: 'Algorithmic problem solving, geospatial thinking, and high-resilience web development.',
    proof: {
      codeLabel: 'Custom Dijkstra implementation in TypeScript',
    },
  },
  {
    id: 'grace-fellowship-portal',
    title: 'Grace Fellowship Community Portal',
    tagline: 'Accessible High-Performance Media Archive & Event Management',
    category: 'Web & Community',
    status: 'production',
    featured: false,
    accentColor: '#6366f1', // indigo-500
    summary: 'A fast, accessible community media portal serving thousands of weekly audio sermon streams, event registrations, and announcements.',
    problem: 'Third-party church CMS platforms are bloated with trackers, load slowly on mobile networks, and cost prohibitive monthly subscription fees.',
    whatIBuilt: 'A lightweight static-first web portal with indexed sermon audio player, full-text transcript search, and zero third-party tracking bloat.',
    myRole: 'Web Developer & UI Designer — Jamstack architecture, audio player implementation, and WCAG AA accessibility compliance.',
    architecture: ['Static generation with Next.js', 'Cloudflare CDN edge caching', 'HTML5 Audio with persistent playback', 'Tailwind CSS'],
    engineeringChallenge: 'Delivering continuous background audio playback while users navigate through sermon transcripts and event pages.',
    whatILearned: 'Audio streaming optimization, global state persistence, and web accessibility standards.',
    builtWith: ['Next.js', 'React', 'Tailwind CSS', 'TypeScript', 'Cloudflare Pages'],
    whatThisDemonstrates: 'Production web performance, 100/100 Lighthouse score engineering, and community-centered design.',
    proof: {
      liveLabel: 'Production Deployed',
    },
  },
  {
    id: 'portfolio-os',
    title: 'Tafadzwa.OS — 3D Portfolio',
    tagline: 'Cinematic Procedural 3D Portfolio & In-Site AI Agent',
    category: 'Flagship AI',
    status: 'production',
    featured: false,
    accentColor: '#06b6d4',
    summary: 'A portfolio experience combining a recruiter-first project view with an optional Three.js scene and an in-site portfolio assistant.',
    problem: 'A portfolio needs to make project evidence easy to review while still giving room for creative interaction.',
    whatIBuilt: 'A responsive project and engineering portfolio with an optional 3D scene, case studies, experiments, and a portfolio-data assistant.',
    myRole: 'Designed and implemented the portfolio experience, its React interface, and its optional Three.js scene.',
    architecture: [
      'Three.js procedural spatial renderer with WebGL context lost recovery',
      'Dynamic spline camera choreography synced to scroll velocity and viewport',
      'Custom vertex & fragment shaders for node network links and candlestick terrain',
      'Full-stack Express API with data-grounded assistant',
      'Recruiter-first view with optional 3D scene',
      'Command Palette (Cmd+K) & mini interactive developer terminal',
    ],
    engineeringChallenge: 'Keeping the 3D experience optional so the content remains fast and readable without WebGL.',
    whatILearned: 'A clear non-3D path makes the portfolio easier to browse and keeps the visual experience under user control.',
    builtWith: ['Three.js', 'React 19', 'TypeScript', 'Tailwind CSS v4', 'Express'],
    whatThisDemonstrates: 'A responsive content experience with an optional interactive Three.js scene.',
    proof: {},
  },
];

export const LAB_EXPERIMENTS: LabExperiment[] = [
  {
    id: 'exp-ai-explainers',
    title: 'Multi-Modal Reasoning Explainer',
    domain: 'AI / HCI',
    tag: 'Structured JSON',
    whatITried: 'Generating real-time SVG flowcharts directly from raw LLM reasoning streams.',
    whatWorked: 'Decomposing the prompt into a two-pass architecture: Pass 1 generates topological graph nodes, Pass 2 computes layout coordinates.',
    whatFailed: 'Asking the model to calculate pixel positions in a single prompt led to overlapping text and broken bounding boxes.',
    whatILearned: 'LLMs are great at relational semantics, but terrible at Cartesian coordinate calculations. Let the model handle relationships; let code handle geometry.',
    wouldBuildNext: 'A WebGPU layout engine that physics-simulates node positioning directly in browser compute shaders.',
    technologies: ['Gemini Flash', 'SVG', 'D3-hierarchy', 'TypeScript'],
  },
  {
    id: 'exp-cv-landmarks',
    title: 'Sub-Pixel Iris Landmark Tracking',
    domain: 'Computer Vision',
    tag: 'Edge Inference',
    whatITried: 'Tracking gaze vector and micro-blinks using pure client-side OpenCV.js in WebAssembly.',
    whatWorked: 'Downsampling input frame resolution to 320x240 for landmark detection, then interpolating coordinates back to native display scale.',
    whatFailed: 'Running full 1080p landmark detection in WASM pegged mobile CPU at 100% and dropped frames to 8 FPS.',
    whatILearned: 'Computer vision efficiency is all about cascading resolutions: cheap detectors find the face box; precise sub-pixel detectors only inspect the eye crop.',
    wouldBuildNext: 'A browser privacy-first attention tracker for online technical exams that runs 100% locally with zero server transmission.',
    technologies: ['OpenCV.js', 'WebAssembly', 'HTML5 Video', 'NumPy'],
  },
  {
    id: 'exp-ai-agents',
    title: 'Autonomous Tool Calling with Dynamic Retries',
    domain: 'AI Agents',
    tag: 'Reliability Engineering',
    whatITried: 'Building an agentic loop with Gemini function calling that self-heals syntax errors in SQL and API requests.',
    whatWorked: 'Injecting compiler stderr directly back into the conversation turn with a strict JSON patch instruction.',
    whatFailed: 'Open-ended retries without a deterministic token budget caused infinite repair loops on semantic schema mismatches.',
    whatILearned: 'Every tool-calling agent must have an immutable maximum hop count (e.g. 3 retries) and fall back to human-in-the-loop escalation.',
    wouldBuildNext: 'A self-healing continuous integration agent that scans failing Vitest reports, produces minimal git diffs, and opens PRs.',
    technologies: ['@google/genai', 'Function Declarations', 'Typebox', 'Node.js'],
  },
  {
    id: 'exp-ml-timeseries',
    title: 'Time-Series Stationarity & Feature Selection',
    domain: 'Machine Learning',
    tag: 'Feature Math',
    whatITried: 'Feeding raw price OHLCV data into Deep Neural Networks (LSTM/GRU) to forecast next-day returns.',
    whatWorked: 'Transforming prices into log returns, fractional differentiation, and calculating statistical volatility bands before training simpler tree ensembles.',
    whatFailed: 'Raw LSTM models immediately overfit the bull market trend and suffered severe catastrophic forgetting during regime shifts.',
    whatILearned: 'Complex deep learning cannot compensate for non-stationary data. Proper feature engineering and humble cross-validation outperform giant models on noisy data.',
    wouldBuildNext: 'An automated feature importance dashboard using SHAP values to explain which economic indicators drive predictions.',
    technologies: ['Python', 'scikit-learn', 'Pandas', 'Statsmodels'],
  },
  {
    id: 'exp-3d-webgl',
    title: 'Instanced Particle Compute in WebGL',
    domain: '3D Graphics',
    tag: 'Custom Shaders',
    whatITried: 'Rendering many interconnected data nodes in a Three.js scene.',
    whatWorked: 'Using `THREE.InstancedMesh` with custom vertex attribute buffers and updating positions inside vertex shader math instead of JavaScript CPU loops.',
    whatFailed: 'Creating an individual `THREE.Mesh` object for each node increased JavaScript overhead and caused visible stutter.',
    whatILearned: 'The GPU is a parallel powerhouse: keep data on the GPU and only stream uniform delta changes from JavaScript.',
    wouldBuildNext: 'Compute-shader physics simulated over WebGPU with audio-frequency reaction.',
    technologies: ['Three.js', 'GLSL Shaders', 'InstancedMesh', 'WebGL2'],
  },
  {
    id: 'exp-dev-tools',
    title: 'Automated AST Rule Enforcer',
    domain: 'Developer Tooling',
    tag: 'Static Analysis',
    whatITried: 'Building a custom ESLint plugin to forbid hardcoded magic strings in API payload calls across project codebases.',
    whatWorked: 'Traversing the TypeScript AST with `@typescript-eslint/parser` and matching `CallExpression` nodes against contract schemas.',
    whatFailed: 'Trying to regex match files instead of AST traversal; led to hundreds of false positives inside comment blocks.',
    whatILearned: 'Code is a structured tree, not a string. Treating code as an AST unlocks robust custom linters and architectural guards.',
    wouldBuildNext: 'A Git pre-commit hook that automatically generates TypeScript types from OpenAPI and GraphQL schemas.',
    technologies: ['TypeScript AST', 'ESLint API', 'Node.js'],
  },
  {
    id: 'exp-automation',
    title: 'Event-Driven Webhook Dispatcher',
    domain: 'Systems Architecture',
    tag: 'Distributed Events',
    whatITried: 'Building a transactional outbox queue in PostgreSQL to deliver guaranteed webhooks with exponential backoff.',
    whatWorked: 'Writing the payload to an outbox table in the same DB transaction as the business operation, polled by a separate worker pool.',
    whatFailed: 'Firing webhooks directly inside HTTP request handlers; third-party timeouts stalled client connections and lost dropped events.',
    whatILearned: 'Never execute external side-effects inside user-facing transactional HTTP lifecycles. Always decouple through an outbox or persistent queue.',
    wouldBuildNext: 'A serverless dead-letter queue inspector with automated replay capabilities.',
    technologies: ['PostgreSQL', 'Redis', 'Node.js', 'Docker'],
  },
];

export const SKILL_CONSTELLATION: SkillNode[] = [
  { id: 'sk-ai', name: 'AI APIs and source-backed answers', category: 'AI / ML', proficiency: 'Core', projects: ['explainai'], description: 'Search decisions and source relevance checks in ExplainAI.' },
  { id: 'sk-typescript', name: 'TypeScript', category: 'Engineering', proficiency: 'Core', projects: ['explainai', 'kazilink', 'aws-compliance-checker'], description: 'Used across the AI answer engine, marketplace, and AWS checker repositories.' },
  { id: 'sk-react', name: 'React', category: 'Frontend', proficiency: 'Core', projects: ['explainai', 'kazilink', 'aws-compliance-checker'], description: 'Used in the ExplainAI, KaziLink, and AWS checker interfaces.' },
  { id: 'sk-node', name: 'Node.js and Express', category: 'Backend', proficiency: 'Core', projects: ['kazilink'], description: 'Server-side routes in the KaziLink repository.' },
  { id: 'sk-supabase', name: 'Supabase', category: 'Backend', proficiency: 'Core', projects: ['kazilink'], description: 'Data service integration in KaziLink.' },
  { id: 'sk-three', name: 'Three.js and WebGL', category: 'Design & 3D', proficiency: 'Core', projects: ['portfolio-os'], description: 'Optional procedural 3D scene in this portfolio.' },
  { id: 'sk-aws', name: 'AWS SDK for JavaScript v3', category: 'Deployment', proficiency: 'Core', projects: ['aws-compliance-checker'], description: 'EC2 API integration in the security-group compliance checker.' },
];

export const HOW_I_BUILD_STAGES = [
  {
    step: '01',
    name: 'Understand',
    tagline: 'Clarify the user problem',
    description: 'Identify the people, task, constraints, and failure cases the software needs to address.',
  },
  {
    step: '02',
    name: 'Design',
    tagline: 'Plan the interface and data flow',
    description: 'Sketch the key screens and define how data moves between the interface, services, and storage.',
  },
  {
    step: '03',
    name: 'Build',
    tagline: 'Implement in small increments',
    description: 'Build the core behavior first, then connect it to a clear and usable interface.',
  },
  {
    step: '04',
    name: 'Test',
    tagline: 'Check expected and error paths',
    description: 'Exercise the main user flows, invalid input, empty states, and failures at service boundaries.',
  },
  {
    step: '05',
    name: 'Iterate',
    tagline: 'Review and refine',
    description: 'Use test results and review feedback to improve clarity, reliability, and maintainability.',
  },
  {
    step: '06',
    name: 'Ship',
    tagline: 'Prepare a release',
    description: 'Document setup, check production configuration, and make the application straightforward to run.',
  },
];

export const AI_ENGINEERING_STAGES = [
  { step: '01', title: 'Question', role: 'User input', detail: 'The user asks a question in the ExplainAI interface.' },
  { step: '02', title: 'Search decision', role: 'Application logic', detail: 'The answer flow determines whether a web search is needed.' },
  { step: '03', title: 'Source check', role: 'Relevance check', detail: 'Search results are checked for relevance before they are used.' },
  { step: '04', title: 'Answer', role: 'Generated response', detail: 'The application returns an answer using the selected sources.' },
];
