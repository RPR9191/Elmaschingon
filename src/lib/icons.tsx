import React from "react";

export const CategoryIcon = ({ name, className = "w-8 h-8" }: { name: string; className?: string }) => {
  const icons: Record<string, React.ReactNode> = {
    taco: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
        <path d="M8 14s1.5 2 4 2 4-2 4-2" />
        <path d="M9 9h.01" />
        <path d="M15 9h.01" />
      </svg>
    ),
    chorreada: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
        <circle cx="12" cy="9" r="2.5" />
      </svg>
    ),
    vampiro: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
        <path d="M10 8h6" />
        <path d="M10 12h6" />
        <path d="M10 16h4" />
      </svg>
    ),
    gringa: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v12" />
        <path d="M6 12h12" />
      </svg>
    ),
    burrito: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 17c3.5-3 7-5 9-5s5.5 2 9 5" />
        <path d="M3 7c3.5-3 7-3 9-3s5.5 0 9 3" />
        <path d="M3 12c3.5-3 7-4 9-4s5.5 1 9 4" />
      </svg>
    ),
    quesadilla: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 12c0-5.5 4.5-10 10-10s10 4.5 10 10-4.5 10-10 10S2 17.5 2 12z" />
        <path d="M8 12l4 4 4-4" />
      </svg>
    ),
  };
  return <>{icons[name] || icons.taco}</>;
};

export const MeatIcon = ({ name, className = "w-8 h-8" }: { name: string; className?: string }) => {
  const icons: Record<string, React.ReactNode> = {
    Asada: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 4a3 3 0 00-3 3v2" />
        <path d="M7 4a3 3 0 013 3v2" />
        <path d="M4 10h16" />
        <path d="M8 16c0 1.5 1.5 3 4 3s4-1.5 4-3" />
        <path d="M6 19l2-3" />
        <path d="M18 19l-2-3" />
      </svg>
    ),
    Pastor: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a3 3 0 00-3 3v4" />
        <path d="M12 2a3 3 0 013 3v4" />
        <path d="M6 14h12" />
        <path d="M9 14v5" />
        <path d="M15 14v5" />
      </svg>
    ),
    Pollo: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 17c-1.5 1-3.5 2-7 2s-5.5-1-7-2" />
        <path d="M5 17v-5a7 7 0 0114 0v5" />
        <path d="M12 10v4" />
      </svg>
    ),
    Chorizo: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8a6 6 0 00-12 0v8a6 6 0 0012 0V8z" />
        <path d="M6 10h12" />
        <path d="M6 14h12" />
        <path d="M8 2v4" />
        <path d="M16 2v4" />
      </svg>
    ),
    Cabeza: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M8 14s1.5 2 4 2 4-2 4-2" />
        <path d="M9 9h.01" />
        <path d="M15 9h.01" />
      </svg>
    ),
  };
  return <>{icons[name] || null}</>;
};