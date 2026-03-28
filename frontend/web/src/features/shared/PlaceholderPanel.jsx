import React from 'react'

export function PlaceholderPanel({ eyebrow, title, description, actions }) {
  return (
    <section className="mx-auto flex max-w-5xl flex-col gap-6 rounded-[2rem] border border-concord-border bg-concord-panel/70 p-6 shadow-[0_25px_80px_rgba(0,0,0,0.25)] md:p-8">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.8fr)]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-concord-accent">
            {eyebrow}
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-concord-text">{title}</h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-concord-muted">{description}</p>
        </div>
        <div className="rounded-[1.75rem] border border-concord-border bg-concord-panel-alt/80 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-concord-muted">
            This Slice Proves
          </p>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-concord-muted">
            <li>Routes already shape the app correctly.</li>
            <li>The shell stays stable while views swap.</li>
            <li>Later sprints can focus on integration instead of redesign.</li>
          </ul>
        </div>
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
