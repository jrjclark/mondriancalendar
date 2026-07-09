import type { ReactNode } from 'react';

interface MondrianGridProps {
  children: ReactNode;
  className?: string;
  label: string;
}

export function MondrianGrid({ children, className = '', label }: MondrianGridProps) {
  return (
    <section className={`mondrian-grid ${className}`} aria-label={label}>
      {children}
    </section>
  );
}
