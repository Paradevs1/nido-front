"use client";

export interface DocHeading {
  id: string;
  label: string;
  level: number;
}

interface OnThisPageProps {
  headings: DocHeading[];
}

export default function OnThisPage({ headings }: OnThisPageProps) {
  if (headings.length === 0) return null;

  return (
    <aside className="w-48 shrink-0 py-6 pl-6 hidden xl:block sticky top-[3.5rem] self-start overflow-hidden">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-white/50 mb-3">
        On this page
      </h4>
      <ul className="space-y-2 border-l border-white/10 pl-2">
        {headings.map((h) => (
          <li key={h.id} className="min-w-0 overflow-hidden">
            <a
              href={`#${h.id}`}
              className="text-sm block py-0.5 pl-2 whitespace-nowrap overflow-hidden text-ellipsis min-w-0 text-white/70 hover:text-[var(--color-primary)] transition-colors"
              title={h.label}
            >
              {h.label}
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
}
