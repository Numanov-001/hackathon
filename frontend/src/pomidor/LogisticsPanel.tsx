type LogisticsPanelProps = {
  onOpenP2P: () => void;
};

export default function LogisticsPanel({ onOpenP2P }: LogisticsPanelProps) {
  return (
    <section className="rounded-[10px] border border-line bg-surface p-4 sm:p-5">
      <h2 className="text-xl font-semibold text-ink">Yetkazib berishni topish</h2>
      <p className="mt-1 text-[13px] text-muted">Transport e’lonlari uchun joy tayyor. Hozircha haqiqiy yuk mashinasi listingi yo‘q — uydirma mashina qo‘shilmaydi.</p>
      <div className="mt-4 rounded-[10px] border border-dashed border-line px-4 py-6 text-sm text-muted">
        🚚 5 tonnalik yuk mashinasi namunasi faqat interfeys. Origin → yo‘nalish, sig‘im va sana haqiqiy e’lon kelganda to‘ldiriladi.
      </div>
      <button type="button" onClick={onOpenP2P} className="mt-4 inline-flex min-h-10 items-center rounded-[6px] border border-line px-3 text-[13px] font-semibold text-ink hover:bg-subtle">
        P2P orqali savdo
      </button>
    </section>
  );
}
