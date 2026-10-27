export function Section({ title, note, grid, children }) {
  return (
    <section className="form-section">
      {title && <h3 className="form-section-title">{title}</h3>}
      {note && <p className="form-note">{note}</p>}
      <div className={grid ? 'field-grid' : 'field-stack'}>{children}</div>
    </section>
  )
}
