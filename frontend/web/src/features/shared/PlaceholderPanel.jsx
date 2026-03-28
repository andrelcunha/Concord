import React from 'react'

export function PlaceholderPanel({ eyebrow, title, description, actions }) {
  return (
    <section className="mx-auto flex max-w-4xl flex-col gap-6 rounded-[2rem] border border-concord-border bg-concord-panel/70 p-8 shadow-[0_25px_80px_rgba(0,0,0,0.25)]">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-concord-accent">
          {eyebrow}
        </p>
        <h2 className="mt-3 text-3xl font-semibold text-concord-text">{title}</h2>
        <p className="mt-4 max-w-2xl text-base leading-7 text-concord-muted">{description}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {actions.map((action) => (
          <div
            key={action}
            className="rounded-2xl border border-concord-border bg-concord-panel-alt/80 p-4 text-sm leading-6 text-concord-muted"
          >
            {action}
          </div>
        ))}
      </div>
    </section>
  )
}
