import { useCallback, useEffect, useState } from "react";
import { deleteJson, getJson, patchJson, postJson } from "../api/client";
import { fetchAllProfiles } from "./data/supabaseApi";
import { cn } from "./lib/cn";

type AdminAppProps = {
  path: string;
  getToken?: () => Promise<string | null>;
  onHome: () => void;
};

type AdminPage = "overview" | "users" | "subscriptions" | "products" | "data" | "p2p" | "transport" | "forecasts" | "alerts" | "settings";

function pageOf(path: string): AdminPage {
  if (path.startsWith("/admin/subscriptions")) return "subscriptions";
  if (path.startsWith("/admin/products")) return "products";
  if (path.startsWith("/admin/data")) return "data";
  if (path.startsWith("/admin/p2p")) return "p2p";
  if (path.startsWith("/admin/transport")) return "transport";
  if (path.startsWith("/admin/forecasts")) return "forecasts";
  if (path.startsWith("/admin/alerts")) return "alerts";
  if (path.startsWith("/admin/settings")) return "settings";
  if (path.startsWith("/admin/users")) return "users";
  return "overview";
}

const NAV: Array<{ id: AdminPage; href: string; label: string }> = [
  { id: "overview", href: "/admin", label: "Dashboard" },
  { id: "users", href: "/admin/users", label: "Users" },
  { id: "subscriptions", href: "/admin/subscriptions", label: "Subscriptions" },
  { id: "products", href: "/admin/products", label: "Products" },
  { id: "data", href: "/admin/data", label: "Market Data" },
  { id: "p2p", href: "/admin/p2p", label: "P2P" },
  { id: "transport", href: "/admin/transport", label: "Transport" },
  { id: "forecasts", href: "/admin/forecasts", label: "Forecasts" },
  { id: "alerts", href: "/admin/alerts", label: "Alerts" },
  { id: "settings", href: "/admin/settings", label: "Settings" },
];

export default function AdminApp({ path, getToken, onHome }: AdminAppProps) {
  const page = pageOf(path);
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [overview, setOverview] = useState<Record<string, unknown> | null>(null);
  const [users, setUsers] = useState<Array<Record<string, unknown>>>([]);
  const [subs, setSubs] = useState<Array<Record<string, unknown>>>([]);
  const [products, setProducts] = useState<Array<Record<string, unknown>>>([]);
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [forecasts, setForecasts] = useState<Array<Record<string, unknown>>>([]);
  const [p2pRows, setP2pRows] = useState<Array<Record<string, unknown>>>([]);
  const [transportRows, setTransportRows] = useState<Array<Record<string, unknown>>>([]);
  const [alertRows, setAlertRows] = useState<Array<Record<string, unknown>>>([]);
  const [cloudUsers, setCloudUsers] = useState<Array<Record<string, unknown>>>([]);
  const [settings, setSettings] = useState<Record<string, string | number>>({});
  const [filter, setFilter] = useState("all");
  const [busy, setBusy] = useState("");

  const auth = useCallback(async () => {
    const next = getToken ? await getToken() : null;
    setToken(next);
    return next;
  }, [getToken]);

  const go = (href: string) => {
    window.history.pushState({}, "", href);
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  const load = useCallback(async () => {
    setError("");
    try {
      const t = await auth();
      if (page === "overview") setOverview((await getJson("/api/admin/overview", t)) as Record<string, unknown>);
      if (page === "users") {
        setUsers((await getJson("/api/admin/users", t)) as Array<Record<string, unknown>>);
        setCloudUsers((await fetchAllProfiles()) as Array<Record<string, unknown>>);
      }
      if (page === "subscriptions") setSubs((await getJson(`/api/admin/subscriptions?status=${filter}`, t)) as Array<Record<string, unknown>>);
      if (page === "products") setProducts((await getJson("/api/admin/products", t)) as Array<Record<string, unknown>>);
      if (page === "data") setData((await getJson("/api/admin/data", t)) as Record<string, unknown>);
      if (page === "p2p") setP2pRows((await getJson("/api/admin/p2p", t)) as Array<Record<string, unknown>>);
      if (page === "transport") setTransportRows((await getJson("/api/admin/transport", t)) as Array<Record<string, unknown>>);
      if (page === "forecasts") setForecasts((await getJson("/api/admin/forecasts", t)) as Array<Record<string, unknown>>);
      if (page === "alerts") setAlertRows((await getJson("/api/admin/alerts", t)) as Array<Record<string, unknown>>);
      if (page === "settings") setSettings((await getJson("/api/admin/settings", t)) as Record<string, string | number>);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Admin panel ochilmadi.");
    }
  }, [auth, page, filter]);

  useEffect(() => {
    load();
  }, [load]);

  async function act(label: string, fn: () => Promise<unknown>) {
    setBusy(label);
    try {
      await fn();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Amal bajarilmadi.");
    } finally {
      setBusy("");
    }
  }

  return (
    <div className="min-h-dvh bg-canvas text-ink">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center gap-3 px-4 py-3">
          <h1 className="text-lg font-semibold">Admin panel</h1>
          <button type="button" onClick={onHome} className="text-sm font-medium text-accent">Bozor</button>
        </div>
        <nav className="mx-auto flex max-w-[1440px] gap-1 overflow-x-auto px-4 pb-2" aria-label="Admin">
          {NAV.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => go(item.href)}
              className={cn("min-h-9 shrink-0 rounded-[6px] px-3 text-[13px] font-semibold", page === item.id ? "bg-soft text-accent" : "text-muted hover:bg-subtle")}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-[1440px] px-4 py-6">
        {error && <p className="mb-4 rounded-[10px] border border-line bg-surface px-4 py-3 text-sm text-bid" role="alert">{error}</p>}
        {page === "overview" && overview && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {([
              ["Foydalanuvchilar", overview.total_users],
              ["Faol", overview.active_users],
              ["Premium", overview.premium_users],
              ["Muddati o‘tgan", overview.expired_subscriptions],
              ["P2P e’lonlar", overview.p2p_listings],
              ["So‘rovlar", overview.active_requests],
              ["Yozuvlar", overview.data_records],
              ["Alertlar", overview.alerts],
              ["Mahsulotlar", overview.total_products],
              ["Oxirgi yangilanish", overview.latest_data_update || "—"],
              ["Daromad", overview.revenue ?? "To‘lov ulanmagan"],
            ] as Array<[string, unknown]>).map(([label, value]) => (
              <div key={label} className="rounded-[10px] border border-line bg-surface p-4">
                <p className="text-[13px] text-muted">{label}</p>
                <p className="mt-1 text-lg font-semibold">{String(value ?? "—")}</p>
              </div>
            ))}
          </div>
        )}
        {page === "users" && (
          <div className="overflow-x-auto rounded-[10px] border border-line bg-surface">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-subtle text-muted">
                <tr>
                  {["Foydalanuvchi", "Email", "Rol", "Obuna", "Holat", "Ro‘yxat", "Tugash", "Amal"].map((h) => <th key={h} className="px-3 py-2 font-medium">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {users.map((row) => (
                  <tr key={String(row.id)} className="border-t border-line">
                    <td className="px-3 py-2">{String(row.name || row.id)}</td>
                    <td className="px-3 py-2">{String(row.email || "—")}</td>
                    <td className="px-3 py-2">{String(row.role)}</td>
                    <td className="px-3 py-2">{String(row.plan)}</td>
                    <td className="px-3 py-2">{String(row.account_status || row.status)}</td>
                    <td className="px-3 py-2">{String(row.registered || "—").slice(0, 10)}</td>
                    <td className="px-3 py-2">{String(row.end_date || "—").slice(0, 10)}</td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap gap-1">
                        <button type="button" className="text-accent" onClick={() => act("p", () => postJson(`/api/admin/users/${row.id}/premium`, { action: "activate", plan: "premium_monthly" }, token))}>Premium</button>
                        <button type="button" onClick={() => act("e", () => postJson(`/api/admin/users/${row.id}/premium`, { action: "extend", plan: "premium_monthly", months: 1 }, token))}>Uzaytir</button>
                        <button type="button" className="text-bid" onClick={() => act("c", () => postJson(`/api/admin/users/${row.id}/premium`, { action: "cancel" }, token))}>Bekor</button>
                        <button type="button" onClick={() => act("r", () => patchJson(`/api/admin/users/${row.id}`, { role: row.role === "admin" ? "user" : "admin" }, token))}>Rol</button>
                        <button type="button" onClick={() => act("s", () => patchJson(`/api/admin/users/${row.id}`, { status: row.account_status === "suspended" ? "active" : "suspended" }, token))}>To‘xtat</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {page === "users" && (
          <div className="mt-6 overflow-x-auto rounded-[10px] border border-line bg-surface">
            <p className="border-b border-line px-3 py-2 text-sm font-semibold">Supabase — barcha foydalanuvchilar</p>
            <p className="px-3 py-2 text-[13px] text-muted">VIP: Table Editor da `vip` ni true qiling yoki SQL: select public.grant_vip('email@gmail.com', 30);</p>
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead className="bg-subtle text-muted">
                <tr>
                  {["Ism", "Email", "VIP", "Tarif", "VIP tugash", "Rol"].map((h) => <th key={h} className="px-3 py-2 font-medium">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {cloudUsers.map((row) => (
                  <tr key={String(row.id || row.clerk_user_id)} className="border-t border-line">
                    <td className="px-3 py-2">{String(row.name || "—")}</td>
                    <td className="px-3 py-2">{String(row.email || "—")}</td>
                    <td className="px-3 py-2">{row.vip ? "ha" : "yo‘q"}</td>
                    <td className="px-3 py-2">{String(row.plan || "free")}</td>
                    <td className="px-3 py-2">{String(row.vip_until || "—").slice(0, 10)}</td>
                    <td className="px-3 py-2">{String(row.role || "user")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!cloudUsers.length && <p className="px-3 py-4 text-sm text-muted">Hali profil yo‘q. SQL ni ishga tushiring, keyin foydalanuvchi kirsın.</p>}
          </div>
        )}
        {page === "subscriptions" && (
          <div>
            <div className="mb-3 flex flex-wrap gap-1">
              {["all", "active", "expired", "cancelled", "premium", "free"].map((item) => (
                <button key={item} type="button" onClick={() => setFilter(item)} className={cn("min-h-9 rounded-[6px] px-3 text-[13px] font-semibold", filter === item ? "bg-soft text-accent" : "text-muted")}>{item}</button>
              ))}
            </div>
            <div className="overflow-x-auto rounded-[10px] border border-line bg-surface">
              <table className="w-full min-w-[800px] text-left text-sm">
                <thead className="bg-subtle text-muted">
                  <tr>
                    {["Foydalanuvchi", "Tarif", "Holat", "Boshlanish", "Tugash", "To‘lov"].map((h) => <th key={h} className="px-3 py-2 font-medium">{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {subs.map((row) => (
                    <tr key={String(row.id)} className="border-t border-line">
                      <td className="px-3 py-2">{String(row.user)}<div className="text-[12px] text-muted">{String(row.email)}</div></td>
                      <td className="px-3 py-2">{String(row.stored_plan || row.plan)}</td>
                      <td className="px-3 py-2">{String(row.status)}</td>
                      <td className="px-3 py-2">{String(row.start_date || "—").slice(0, 10)}</td>
                      <td className="px-3 py-2">{String(row.end_date || "—").slice(0, 10)}</td>
                      <td className="px-3 py-2">{String(row.payment_status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {page === "products" && (
          <div className="grid gap-3">
            {products.map((row) => (
              <div key={String(row.id)} className="flex flex-wrap items-center justify-between gap-2 rounded-[10px] border border-line bg-surface px-4 py-3">
                <p className="font-medium">{String(row.emoji)} {String(row.name)} · {String(row.records)} yozuv</p>
                <button type="button" className="text-sm font-semibold text-accent" onClick={() => act("e", () => patchJson(`/api/admin/products/${row.id}`, { enabled: !row.enabled }, token))}>
                  {row.enabled ? "O‘chirish" : "Yoqish"}
                </button>
              </div>
            ))}
          </div>
        )}
        {page === "data" && data && (
          <div className="grid gap-3">
            <p className="text-sm text-muted">Oxirgi SIAT sinxron: {String(data.last_sync || "—")} · {String(data.last_status || "")}</p>
            <p className="text-sm">Yozuvlar: {String(data.records)} · Oxirgi oy: {String(data.latest_month || "—")} · Xato so‘rovlar: {String(data.failed_requests)}</p>
            <p className="text-sm text-muted">SIAT yozuvlari qo‘lda almashtirilmaydi. Manba maydoni saqlanadi.</p>
            <div className="flex flex-wrap gap-2">
              <button type="button" disabled={Boolean(busy)} className="min-h-10 rounded-[6px] bg-accent px-4 text-sm font-semibold text-on-accent" onClick={() => act("sync", () => postJson("/api/admin/data/sync", {}, token))}>Sync now</button>
              <button type="button" className="min-h-10 rounded-[6px] border border-line px-4 text-sm font-semibold" onClick={() => load()}>Refresh data</button>
              <a className="inline-flex min-h-10 items-center rounded-[6px] border border-line px-4 text-sm font-semibold" href="/api/admin/data/export.csv" onClick={(event) => { event.preventDefault(); auth().then((t) => fetch("/api/admin/data/export.csv", { headers: t ? { Authorization: `Bearer ${t}` } : {} }).then((r) => r.blob()).then((blob) => { const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "market_prices.csv"; a.click(); })); }}>Export CSV</a>
            </div>
          </div>
        )}
        {page === "p2p" && (
          <div className="grid gap-2">
            {p2pRows.map((row) => (
              <div key={String(row.id)} className="flex flex-wrap items-center justify-between gap-2 rounded-[10px] border border-line bg-surface px-4 py-3 text-sm">
                <p>{String(row.product)} · {String(row.side)} · {String(row.region)} · {String(row.status)}</p>
                <div className="flex flex-wrap gap-2">
                  <button type="button" className="text-accent" onClick={() => act("a", () => postJson(`/api/admin/p2p/${row.id}`, { action: "approve" }, token))}>Approve</button>
                  <button type="button" onClick={() => act("r", () => postJson(`/api/admin/p2p/${row.id}`, { action: "reject" }, token))}>Reject</button>
                  <button type="button" onClick={() => act("h", () => postJson(`/api/admin/p2p/${row.id}`, { action: "hide" }, token))}>Hide</button>
                  <button type="button" className="text-bid" onClick={() => act("x", () => postJson(`/api/admin/p2p/${row.id}`, { action: "delete" }, token))}>Delete</button>
                </div>
              </div>
            ))}
            {!p2pRows.length && <p className="text-sm text-muted">P2P e’lonlar yo‘q.</p>}
          </div>
        )}
        {page === "transport" && (
          <div>
            {transportRows.length === 0 ? <p className="text-sm text-muted">Transport e’lonlari yo‘q. Jadval tayyor, ma’lumot kiritilmagan.</p> : transportRows.map((row) => (
              <p key={String(row.id)} className="rounded-[10px] border border-line bg-surface px-4 py-3 text-sm">{String(row.vehicle_type)} · {String(row.origin)} → {String(row.destination)}</p>
            ))}
          </div>
        )}
        {page === "alerts" && (
          <div>
            {alertRows.length === 0 ? <p className="text-sm text-muted">Alertlar yo‘q.</p> : alertRows.map((row) => (
              <p key={String(row.id)} className="rounded-[10px] border border-line bg-surface px-4 py-3 text-sm">{String(row.product)} · {String(row.condition)} · {String(row.threshold)}</p>
            ))}
          </div>
        )}
        {page === "forecasts" && (
          <div className="grid gap-3">
            <button type="button" className="w-fit min-h-10 rounded-[6px] bg-accent px-4 text-sm font-semibold text-on-accent" onClick={() => act("f", () => postJson("/api/admin/forecasts/regenerate", { product: "pomidor", horizon: 6 }, token))}>Qayta hisoblash</button>
            {forecasts.map((row) => (
              <div key={String(row.id)} className="flex flex-wrap items-center justify-between gap-2 rounded-[10px] border border-line bg-surface px-4 py-3 text-sm">
                <p>{String(row.product)} · {String(row.horizon)} oy · {String(row.model)} · {String(row.predicted_price)}</p>
                <button type="button" className="text-bid" onClick={() => act("d", () => deleteJson(`/api/admin/forecasts/${row.id}`, token))}>O‘chirish</button>
              </div>
            ))}
          </div>
        )}
        {page === "settings" && (
          <form
            className="grid max-w-xl gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              act("set", () => patchJson("/api/admin/settings", settings, token));
            }}
          >
            {["site_name", "contact", "premium_monthly_price", "premium_yearly_price", "announcement", "trial_claim_until"].map((key) => (
              <label key={key} className="grid gap-1 text-sm font-medium">
                {key}
                <input className="h-11 rounded-[6px] border border-line px-3" value={String(settings[key] ?? "")} onChange={(e) => setSettings({ ...settings, [key]: e.target.value })} />
              </label>
            ))}
            <label className="grid gap-1 text-sm font-medium">
              Yangilash intervali (daqiqa)
              <input type="number" className="h-11 rounded-[6px] border border-line px-3" value={Number(settings.refresh_minutes || 360)} onChange={(e) => setSettings({ ...settings, refresh_minutes: Number(e.target.value) })} />
            </label>
            <button type="submit" className="min-h-11 rounded-[6px] bg-accent text-sm font-semibold text-on-accent">Saqlash</button>
          </form>
        )}
      </main>
    </div>
  );
}
