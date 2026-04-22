"use client";

import React from "react";

/** Section with optional id for anchor (On this page). Thin horizontal line above title (except first section) and increased spacing. */
export function DocSection({
  id,
  title,
  children,
  className = "",
}: {
  id?: string;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={`scroll-mt-24 mt-16 pt-8 border-t border-white/10 first:mt-0 first:pt-0 first:border-0 ${className}`}
    >
      <h2 className="text-xl font-semibold mb-5 text-[var(--color-primary)]">
        {title}
      </h2>
      {children}
    </section>
  );
}

export function DocParagraph({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={`text-white/85 leading-relaxed mb-4 last:mb-0 ${className}`}>
      {children}
    </p>
  );
}

export function DocBulletList({
  items,
  className = "",
}: {
  items: string[];
  className?: string;
}) {
  return (
    <ul className={`list-disc pl-6 space-y-2 text-white/85 mb-6 ${className}`}>
      {items.map((item, i) => (
        <li key={i} className="leading-relaxed">
          {item}
        </li>
      ))}
    </ul>
  );
}

/** Pillar: title + short description (e.g. Fund Security, Centralized Management) */
export function DocPillar({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`mb-6 last:mb-0 ${className}`}>
      <h3 className="text-base font-semibold text-white mb-2">{title}</h3>
      <p className="text-white/85 leading-relaxed">{children}</p>
    </div>
  );
}

/** Role/Result block: bold label + one line (e.g. Host / Deposits funds...) */
export function DocRoleResult({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`mb-4 last:mb-0 ${className}`}>
      <span className="font-semibold text-white block mb-1">{label}</span>
      <p className="text-white/85 leading-relaxed pl-0">{children}</p>
    </div>
  );
}

/** Divider line between major sections */
export function DocDivider({ className = "" }: { className?: string }) {
  return (
    <hr
      className={`border-white/10 my-10 ${className}`}
      aria-hidden
    />
  );
}
