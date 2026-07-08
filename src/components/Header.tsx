"use client";

import React from "react";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-dark-border bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <svg className="h-7 w-7 text-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-gold sm:text-xl">
              Tacos Sinaloa
            </h1>
            <p className="text-xs text-foreground/50">
              Highland Park, Los Angeles
            </p>
          </div>
        </div>
        <a
          href="tel:3233032084"
          className="flex items-center gap-1.5 rounded-lg border border-dark-border px-3 py-1.5 text-sm text-gold transition-colors hover:border-gold/30 hover:bg-gold/5"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
          </svg>
          (323) 303-2084
        </a>
      </div>
    </header>
  );
}