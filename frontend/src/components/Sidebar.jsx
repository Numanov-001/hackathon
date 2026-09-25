const LINKS = [
  ["markets", "Markets"],
  ["p2p", "Intentions"],
  ["analytics", "Summary"],
  ["forecast", "Forecast"],
  ["recs", "Opportunities"],
  ["ai", "Assistant"],
];

export default function Sidebar({ collapsed, open, section, onSection, onToggle }) {
  return (
    <aside className={`sidebar ${open ? "open" : ""}`}>
      <div className="brand">
        <span className="brand-mark" aria-hidden="true" />
        {!collapsed && (
          <div>
            Bozor
            <small>Analitika</small>
          </div>
        )}
      </div>
      <nav className="nav" aria-label="Sections">
        {LINKS.map(([id, label]) => (
          <button
            key={id}
            className={`side-link ${section === id ? "active" : ""}`}
            aria-current={section === id ? "page" : undefined}
            aria-label={collapsed ? label : undefined}
            onClick={() => onSection(id)}
          >
            {collapsed ? label[0] : label}
          </button>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <button className="nav-btn" onClick={onToggle}>{collapsed ? ">" : "Collapse"}</button>
        {!collapsed && <button className="nav-btn">Settings</button>}
        <div className="profile-row">
          <span className="avatar">B</span>
          {!collapsed && <span>Demo operator</span>}
        </div>
      </div>
    </aside>
  );
}
