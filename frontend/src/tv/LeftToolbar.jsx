import { GLYPH, Icon } from "./icons.jsx";

const TOOLS = [
  ["cursor", "Crosshair", GLYPH.cursor],
  ["trend", "Trend line", GLYPH.trend],
  ["hline", "Horizontal line", GLYPH.channel],
  ["brush", "Brush", GLYPH.brush],
  ["text", "Text", GLYPH.text],
  ["shape", "Shapes", GLYPH.shape],
  ["measure", "Measure", GLYPH.measure],
  ["zoom", "Zoom", GLYPH.zoom],
  ["magnet", "Magnet", GLYPH.magnet],
  ["lock", "Lock", GLYPH.lock],
  ["eye", "Hide drawings", GLYPH.eye],
  ["erase", "Remove drawings", GLYPH.trash],
];

export default function LeftToolbar({ tool, onTool }) {
  return (
    <nav className="flex w-12 shrink-0 flex-col items-center gap-0.5 border-r border-[#e0e3eb] bg-white py-1" aria-label="Drawing tools">
      {TOOLS.map(([id, label, glyph]) => (
        <button
          key={id}
          type="button"
          title={label}
          aria-label={label}
          aria-pressed={tool === id}
          onClick={() => onTool(id)}
          className={`grid h-8 w-8 place-items-center rounded text-[#787b86] hover:bg-[#f0f3fa] hover:text-[#131722] ${tool === id ? "bg-[#f0f3fa] text-[#131722]" : ""}`}
        >
          <Icon d={glyph} />
        </button>
      ))}
    </nav>
  );
}
