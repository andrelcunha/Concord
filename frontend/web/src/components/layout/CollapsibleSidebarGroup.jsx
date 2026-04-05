import React from 'react'

export function CollapsibleSidebarGroup({
  title,
  isExpanded,
  onToggle,
  children,
  collapsedContent = null,
}) {
  return (
    <section className="mb-6">
      <button
        type="button"
        onClick={onToggle}
        className="mb-3 flex w-full items-center gap-2 px-2 text-left text-xs font-semibold uppercase tracking-[0.28em] text-concord-muted transition hover:text-concord-text"
      >
        <span>{title}</span>
        <span
          className={`text-[10px] transition ${isExpanded ? 'rotate-90' : ''}`}
          aria-hidden="true"
        >
          &gt;
        </span>
      </button>

      {isExpanded ? children : collapsedContent}
    </section>
  )
}
