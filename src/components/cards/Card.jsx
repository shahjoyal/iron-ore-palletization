/** Shared frame: header strip, flexible body, optional footer. */
export function Card({ className = '', title, meta, children, footer }) {
  return (
    <section className={`card ${className}`}>
      <header className="card-head">
        <h2 className="card-title">{title}</h2>
        {meta && <div className="card-meta">{meta}</div>}
      </header>
      <div className="card-body">{children}</div>
      {footer && <footer className="card-foot">{footer}</footer>}
    </section>
  )
}
