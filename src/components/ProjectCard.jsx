import { ArrowUpRight } from 'lucide-react';

export default function ProjectCard({ title, description, meta }) {
  return (
    <article className="project-card">
      <p>{meta}</p>
      <h3>{title}</h3>
      <span>{description}</span>
      <button type="button" aria-label={`${title} details`}>
        <ArrowUpRight aria-hidden="true" size={18} />
      </button>
    </article>
  );
}
