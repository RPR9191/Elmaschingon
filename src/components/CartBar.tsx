"use client";

import React from "react";

interface CartBarProps {
  itemCount: number;
  total: number;
  onReview: () => void;
}

export default function CartBar({ itemCount, total, onReview }: CartBarProps) {
  if (itemCount === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-dark-border bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gold/10 text-gold">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </p>
            <p className="text-lg font-bold text-gold">
              ${total.toFixed(2)}
            </p>
          </div>
        </div>
        <button
          onClick={onReview}
          className="rounded-lg bg-gold px-6 py-2.5 text-sm font-semibold text-background transition-colors hover:bg-gold-dark active:bg-gold-dark"
        >
          Revisar pedido
        </button>
      </div>
    </div>
  );
}