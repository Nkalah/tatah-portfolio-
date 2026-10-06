# Tafadzwa Nkala — Portfolio

A recruiter-first portfolio for Tafadzwa Nkala. The default view presents selected engineering work, project evidence, skills, and contact information; an optional 3D view is available from the navigation or with `?mode=3d`.

## Run locally

Requirements: Node.js 20.19+ (or 22.12+) and npm.

```bash
npm install
npm run dev
```

Open <http://localhost:3000>. The development server provides the portfolio API routes as well as the Vite app.

## Production

```bash
npm run build
npm start
```

The Express server serves the compiled `dist` directory and the API routes. Set `PORT` in the hosting environment if the platform assigns a port. Deploy to a Node.js host that runs the start command; a static-only Vite deployment will not provide the Express API routes.

## API routes

- `GET /api/ping` — portfolio API health check.
- `POST /api/ask-portfolio` — answers from the structured portfolio record; it does not call a generative model. Questions without a matching recorded fact receive an explicit unknown response.
- `GET /api/github` — reads recent public push events from GitHub. This optional endpoint depends on GitHub availability and rate limits.

No API key is required for the portfolio assistant.

## Content and experience

The featured projects are ExplainAI, KaziLink, and the AWS Security Group Compliance Checker. CampusConnect and Kisto's Pig Farm appear as secondary projects. Live project URLs and preview-image paths are recorded in `src/data/portfolioData.ts`; screenshots are served locally from `public/projects/`. ExplainAI uses a labeled answer-flow illustration rather than a product screenshot.

The recruiter-first view is the default and keeps the information readable without WebGL. Its motion design includes scroll-triggered section reveals, a scroll progress indicator, active-section navigation, a subtle pointer-responsive portrait frame, and project-card lighting. These effects respect `prefers-reduced-motion`. The optional 3D view layers a restrained starfield behind the content; its parallax follows smoothed scroll position and velocity, stars briefly highlight on hover, and project globes use layered orbital paths and subtle surface grids. Particle counts and effects are reduced on small screens and low-core devices, and camera travel/streaks are disabled when reduced motion is enabled.

Update verified profile, project, and contact details in `src/data/portfolioData.ts`. The downloadable resume is served from `public/resume.pdf`.
