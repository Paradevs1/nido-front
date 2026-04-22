import Link from "next/link";
import React from "react";

interface BreadcrumbItem {
  label: string;
  href?: string;
  isCurrent?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <div className="mb-6">
      <nav aria-label="Breadcrumb" className="text-sm text-gray-400">
        <ol className="flex flex-wrap items-center gap-2">
          {items.map((item, index) => (
            <li key={`${item.label}-${index}`} className="flex items-center gap-2">
              {item.isCurrent || !item.href ? (
                <span
                  className={item.isCurrent ? "text-white" : ""}
                  aria-current={item.isCurrent ? "page" : undefined}
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="hover:text-white transition-colors"
                >
                  {item.label}
                </Link>
              )}
              {index < items.length - 1 && (
                <span className="text-gray-500">&gt;</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </div>
  );
}
