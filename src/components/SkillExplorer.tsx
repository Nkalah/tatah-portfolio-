import React, { useState } from 'react';
import { ArrowUpRight, Github } from 'lucide-react';
import { PROJECTS } from '../data/portfolioData.ts';

const skillGroups = [
  {
    id: 'ai',
    title: 'AI & product',
    skills: ['AI answer flow', 'Web search decisions', 'Source relevance checks', 'Groq API'],
    proof: ['explainai'],
  },
  {
    id: 'full-stack',
    title: 'Full stack',
    skills: ['React', 'TypeScript', 'Node.js', 'Express', 'Supabase'],
    proof: ['kazilink'],
  },
  {
    id: 'cloud',
    title: 'Cloud tooling',
    skills: ['AWS EC2 scanning', 'Compliance rules', 'Scoring', 'Report helpers'],
    proof: ['aws-compliance-checker'],
  },
];

export function SkillExplorer() {
  const [activeSkillId, setActiveSkillId] = useState(skillGroups[0].id);
  const activeSkillGroup = skillGroups.find((group) => group.id === activeSkillId) ?? skillGroups[0];
  const skillProof = activeSkillGroup.proof
    .map((id) => PROJECTS.find((project) => project.id === id))
    .filter((project): project is (typeof PROJECTS)[number] => project !== undefined);

  return (
    <div className={`skill-explorer skill-explorer--${activeSkillGroup.id}`}>
      <div className="skill-selector" role="tablist" aria-label="Skill areas">
        {skillGroups.map((group) => (
          <button
            key={group.id}
            id={`skill-tab-${group.id}`}
            role="tab"
            aria-selected={activeSkillId === group.id}
            aria-controls="skill-evidence-panel"
            onClick={() => setActiveSkillId(group.id)}
          >
            {group.title}
          </button>
        ))}
      </div>
      <div id="skill-evidence-panel" className="skill-evidence-panel" role="tabpanel" aria-labelledby={`skill-tab-${activeSkillGroup.id}`}>
        <div>
          <p className="story-stage-label">Skills</p>
          <ul className="skill-focus-list">
            {activeSkillGroup.skills.map((skill) => <li key={skill}>{skill}</li>)}
          </ul>
        </div>
        <div>
          <p className="story-stage-label">Proof in selected projects</p>
          <div className="skill-proof-list">
            {skillProof.map((project) => (
              <article className="skill-proof" key={project.id}>
                <div>
                  <h3>{project.title}</h3>
                  <p>{project.outcome ?? project.whatThisDemonstrates}</p>
                </div>
                {project.githubUrl && (
                  <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                    <Github aria-hidden="true" />
                    Repository
                    <ArrowUpRight aria-hidden="true" />
                  </a>
                )}
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
