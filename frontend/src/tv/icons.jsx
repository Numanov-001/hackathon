export function Icon({ d, className = "h-4 w-4" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

export const GLYPH = {
  cursor: "M5 4l6 15 2-6 6-2z",
  trend: "M4 18l6-6 4 3 6-8",
  channel: "M4 16l16-8M4 20l16-8M8 8h.01",
  brush: "M4 16c2 2 4 2 6 0l8-8-3-3-8 8c-2 2-2 4 0 6zM15 6l3 3",
  text: "M6 19V6h12M9 19h6",
  shape: "M5 7h6v6H5zM13 11h6v6h-6z",
  measure: "M4 8h16M8 8v3M12 8v4M16 8v3M6 16h12",
  zoom: "M11 6a5 5 0 100 10 5 5 0 000-10zM15 15l4 4",
  magnet: "M7 4v8a5 5 0 0010 0V4M7 4h3v6H7zM14 4h3v6h-3z",
  lock: "M8 11V8a4 4 0 018 0v3M6 11h12v9H6z",
  eye: "M2 12s4-6 10-6 10 6 10 6-4 6-10 6S2 12 2 12zM12 15a3 3 0 100-6 3 3 0 000 6z",
  trash: "M5 7h14M9 7V5h6v2M8 7l1 13h6l1-13",
  indicator: "M4 16l4-5 3 3 5-7 4 4",
  bell: "M6 16h12l-1-2V10a5 5 0 00-10 0v4zM10 18a2 2 0 004 0",
  replay: "M5 12a7 7 0 111 4M5 16v-4h4",
  compare: "M5 7h6v10H5zM13 10h6v7h-6z",
  chevron: "M6 9l6 6 6-6",
  save: "M6 4h9l3 3v13H6zM8 4v5h7M8 20v-6h8v6",
  layout: "M4 5h16v14H4zM4 10h16M10 10v9",
  trade: "M4 8h16M4 16h16M8 4v16M16 4v16",
};
