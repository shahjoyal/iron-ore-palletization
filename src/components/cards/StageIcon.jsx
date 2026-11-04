/** Small line icons for each process stage, drawn on a 24px grid. */
const PATHS = {
  feed: <><path d="M4 5h16l-5.5 7v6l-5 2v-8z" /><circle cx="8" cy="3" r="0.6" /><circle cx="12" cy="2.5" r="0.6" /><circle cx="16" cy="3" r="0.6" /></>,
  grind: <><circle cx="12" cy="12" r="8.5" /><circle cx="9" cy="13" r="1.8" /><circle cx="14.5" cy="9.5" r="1.4" /><circle cx="14.5" cy="15" r="1.1" /></>,
  filter: <><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="2" /><path d="M12 3.5v6.5M12 14v6.5M3.5 12H10M14 12h6.5" /></>,
  mix: <><rect x="3.5" y="7" width="17" height="10" rx="5" /><path d="M8 12h8M12 9v6" /></>,
  greenball: <><circle cx="8.5" cy="15.5" r="4" /><circle cx="16" cy="14" r="3.2" /><circle cx="12" cy="7.5" r="3" /></>,
  indu: <><path d="M12 3c1 3.5 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 .3 1.2 1 2 2 2.2C10.5 8.5 11 5.5 12 3z" /></>,
}

export function StageIcon({ id, size = 24 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {PATHS[id] || <circle cx="12" cy="12" r="8" />}
    </svg>
  )
}
