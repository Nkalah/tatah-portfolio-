import { FEATURED_PROJECT_IDS, PORTFOLIO_OWNER, PROJECTS } from '../data/portfolioData.ts';

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const UNKNOWN_ANSWER = "I don't have that information in my portfolio record.";

const projectAliases: Record<string, string[]> = {
  explainai: ['explainai', 'ai-explainer', 'answer engine', 'search relevance'],
  kazilink: ['kazilink', 'marketplace'],
  'aws-compliance-checker': ['aws', 'security group', 'compliance checker'],
};

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + 60000 });
    return true;
  }
  if (entry.count >= 20) return false;
  entry.count += 1;
  return true;
}

function findProject(question: string) {
  const match = Object.entries(projectAliases).find(([, aliases]) =>
    aliases.some((alias) => question.includes(alias))
  );
  return match ? PROJECTS.find((project) => project.id === match[0]) : undefined;
}

function answerFromPortfolio(question: string): string {
  const normalizedQuestion = question.toLowerCase();

  if (/\b(contact|email|reach|linkedin|github)\b/.test(normalizedQuestion)) {
    if (normalizedQuestion.includes('linkedin')) return PORTFOLIO_OWNER.links.linkedin;
    if (normalizedQuestion.includes('github')) return PORTFOLIO_OWNER.links.github;
    return PORTFOLIO_OWNER.email;
  }

  if (/\b(availability|available|hire|opportunities|roles)\b/.test(normalizedQuestion)) {
    return `${PORTFOLIO_OWNER.statusBadge}. ${PORTFOLIO_OWNER.lookingFor}.`;
  }

  if (/\b(education|study|studied|degree|university)\b/.test(normalizedQuestion)) {
    return 'The portfolio lists Computer Science & Engineering with an AI specialization. It does not list a degree award or dates.';
  }

  if (/\b(role|position|headline|what do you do)\b/.test(normalizedQuestion)) {
    return PORTFOLIO_OWNER.headline;
  }

  const project = findProject(normalizedQuestion);
  if (project) {
    if (/\b(technology|technologies|tech stack|stack|framework|language|built with)\b/.test(normalizedQuestion)) {
      return `${project.title} lists these technologies: ${project.builtWith.join(', ')}.`;
    }
    if (/\b(problem|why|challenge)\b/.test(normalizedQuestion)) {
      return project.problem;
    }
    if (/\b(contribution|contributed|role|responsibility)\b/.test(normalizedQuestion)) {
      return project.myRole;
    }
    if (/\b(metric|metrics|users|user count|performance)\b/.test(normalizedQuestion)) {
      return project.proof.metrics ?? "No verified user count, performance result, or metric is recorded for this project.";
    }
    if (/\b(result|outcome|production)\b/.test(normalizedQuestion)) {
      return project.outcome ?? "No verified result is recorded for this project.";
    }
    if (/\b(learn|lesson|learned)\b/.test(normalizedQuestion)) {
      return project.whatILearned;
    }
    if (/\b(architecture|system|how does|how did|how was)\b/.test(normalizedQuestion)) {
      return project.architecture.join('; ');
    }
    return `${project.summary} ${project.myRole}`;
  }

  if (/\b(skill|skills|technology|technologies|stack)\b/.test(normalizedQuestion)) {
    const technologies = [...new Set(
      PROJECTS.filter((project) => FEATURED_PROJECT_IDS.includes(project.id))
        .flatMap((project) => project.builtWith)
    )];
    return `The featured project repositories list: ${technologies.join(', ')}.`;
  }

  return UNKNOWN_ANSWER;
}

export async function handleAskPortfolio(
  question: string,
  clientIp = '127.0.0.1'
): Promise<{ answer: string; source: 'portfolio_data' | 'local_fallback' }> {
  if (typeof question !== 'string' || !question.trim()) {
    return { answer: UNKNOWN_ANSWER, source: 'local_fallback' };
  }

  if (!checkRateLimit(clientIp)) {
    return {
      answer: 'Question limit reached. Please try again in a minute.',
      source: 'local_fallback',
    };
  }

  const cleanQuestion = question.trim().slice(0, 300);
  if (!cleanQuestion) {
    return { answer: UNKNOWN_ANSWER, source: 'local_fallback' };
  }

  return {
    answer: answerFromPortfolio(cleanQuestion),
    source: 'portfolio_data',
  };
}

interface GitHubPushEvent {
  type?: unknown;
  created_at?: unknown;
  repo?: { name?: unknown };
  payload?: {
    commits?: Array<{ message?: unknown; sha?: unknown }>;
  };
}

export async function handleGitHubActivity(): Promise<{
  username: string;
  recentCommits: Array<{ repo: string; message: string; date: string; sha: string }>;
  status: string;
}> {
  const response = await fetch('https://api.github.com/users/Nkalah/events/public?per_page=30', {
    headers: {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'tafadzwa-portfolio',
    },
  });
  if (!response.ok) {
    throw new Error(`GitHub activity request failed with status ${response.status}`);
  }

  const payload: unknown = await response.json();
  if (!Array.isArray(payload)) {
    throw new Error('GitHub activity response was not an event list');
  }

  const recentCommits = payload
    .filter((event: GitHubPushEvent) => event.type === 'PushEvent')
    .flatMap((event: GitHubPushEvent) => {
      const repo = event.repo?.name;
      const date = event.created_at;
      if (typeof repo !== 'string' || typeof date !== 'string') return [];
      return (event.payload?.commits ?? []).flatMap((commit) => {
        const message = commit.message;
        const sha = commit.sha;
        if (typeof message !== 'string' || typeof sha !== 'string') return [];
        return [{
          repo,
          message,
          date,
          sha: sha.slice(0, 7),
        }];
      });
    })
    .slice(0, 4);

  return {
    username: 'Nkalah',
    recentCommits,
    status: recentCommits.length ? 'Public push activity' : 'No recent public pushes',
  };
}
