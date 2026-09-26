"""AI-powered price prediction via OpenRouter.

Collects 24-month history, market profile, and news context,
then asks a language model for a JSON prediction with explanation.
Falls back to LinearRegression if the AI call fails.
"""

import json
import logging
from datetime import date

import httpx
import numpy as np

from app.core.config import get_settings
from app.schemas.forecast import PredictionExplanation, PredictionPoint, PredictionRead

logger = logging.getLogger(__name__)

OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"

# Hardcoded market profiles (matches frontend analysis.ts)
MARKET_PROFILES: dict[str, dict] = {
    "Pomidor": {
        "hubs": "Toshkent, Samarqand, Andijon issiqxonalari",
        "season": "Iyul–sentabr dala hosili arzon; dekabr–mart issiqxona tufayli qimmat",
        "drivers": ["Issiqxona energiya narxi", "Yozgi dala hosili", "Viloyatlardan yetkazish xarajati"],
        "note": "Qishki o'rtacha yozgidan 2–3 barobar yuqori bo'lishi mumkin. Kg hisobida sotiladi.",
    },
    "Kartoshka": {
        "hubs": "Samarqand, Buxoro, Toshkent omborlari",
        "season": "Sentabr–noyabr yig'im arzon; qish–bahor ombordan qimmatroq",
        "drivers": ["Kuzgi yig'im hajmi", "Ombor zaxirasi", "Optom minimum 10 kg"],
        "note": "Yig'imdan keyin eng arzon. Bahorda ombor narxi 30–50% ga ko'tariladi.",
    },
    "Piyoz": {
        "hubs": "Andijon, Namangan, Qashqadaryo",
        "season": "Avgust–oktabr yig'im arzon; mart–may ombordan qimmat",
        "drivers": ["Kuzgi zaxira miqdori", "Eksport talabi", "Ombor namligi va saqlash sharoiti"],
        "note": "Yig'im oyida eng past narx, kech bahorda 40–60% qimmatroq.",
    },
    "Bodring": {
        "hubs": "Toshkent viloyati, Farg'ona issiqxonalari",
        "season": "Iyun–avgust dala arzon; qish issiqxonadan qimmat",
        "drivers": ["Issiqxona xarajati", "Yozgi dala hosili", "Tez buzilish — kunlik taklif"],
        "note": "Saqlanmaydi — kunlik taklif o'zgarishi narxni tez siljitadi. Qish–yoz farqi 3–4 baravar.",
    },
    "PE suv trubasi": {
        "hubs": "Toshkent, Samarqand qurilish bozorlari",
        "season": "Mart–iyun suv tarmog'i qurilish mavsumi — talab yuqori",
        "drivers": ["Viloyat suv loyihalari byudjeti", "Polimer xomashyo narxi", "Qurilish mavsumi"],
        "note": "Hisob 1 metrda. Qurilish mavsumida talab va narx 15–25% ko'tariladi.",
    },
    "Metall truba": {
        "hubs": "Toshkent, Navoiy, Qashqadaryo",
        "season": "Bahor–yoz qurilish mavsumi; import metallga doimo sezgir",
        "drivers": ["Metall import narxi", "Qurilish smetasi va byudjeti", "Valyuta kursi"],
        "note": "Sabzavotdan kam mavsumiy, lekin metall va dollar kursi kuchli ta'sir qiladi.",
    },
    "PVC kanalizatsiya": {
        "hubs": "Toshkent, Farg'ona",
        "season": "Kanalizatsiya obyektlari qurilishi bahor–kuz",
        "drivers": ["PVC xomashyo narxi", "Uy-joy qurilish hajmi", "Metrda optom"],
        "note": "PE dan barqarorroq — mavsumiy o'zgarish 10–15% atrofida.",
    },
    "Bug'doy uni": {
        "hubs": "Toshkent, Jizzax, Qashqadaryo tegirmonlari",
        "season": "Bug'doy yig'imi (iyun–iyul) dan keyin qop arzonroq; qish–bahorda qimmatroq",
        "drivers": ["Mahalliy bug'doy hosili", "Import un narxi", "Tegirmon ombor aylanmasi"],
        "note": "Qop hisobida sotiladi (50 kg). Kg kotirovkasi alohida. Yillik o'zgarish 5–10%.",
    },
    "Kungaboqar yog'i": {
        "hubs": "Toshkent optom, import omborlari",
        "season": "Import partiyasiga bog'liq — aniq mavsum yo'q, lekin kuz–qish biroz qimmatroq",
        "drivers": ["Import narx (Rossiya, Qozog'iston)", "Dollar/so'm kursi", "Ombor zaxirasi"],
        "note": "Ichki hosildan ko'ra tashqi narx va valyuta kursi 80% ta'sir qiladi.",
    },
    "Guruch": {
        "hubs": "Xorazm, Qoraqalpog'iston, Toshkent optom",
        "season": "Kuzgi yig'im (sentabr–oktabr) arzon; qish–bahor ombordan qimmatroq",
        "drivers": ["Mahalliy Xorazm yig'imi", "Import guruch narxi", "Ombor zaxirasi"],
        "note": "Optom kilogramda sotiladi. Un qoplaridan alohida kotirovka.",
    },
}

NEWS_CONTEXT = [
    "Pomidor: sentabr 2026 — yozgi dala hosili tugamoqda, narx 12 oylik pastga yaqin. Oktabr–noyabrda issiqxonaga o'tish boshlanadi, narx ko'tarila boshlaydi.",
    "Metall truba: 2025–2026 davomida metall va dollar kursi barqaror o'sdi. Qurilish smetalarida metr narxi yuqorilashmoqda.",
    "Un: tegirmon aylanmasi yuqori, qop narxi barqaror. Yangi bug'doy yig'imidan keyin biroz arzonlashdi.",
    "Yog': import partiyalariga bog'liq. Dollar kursi oshsa, yog' narxi ham ko'tariladi. Hozircha barqaror.",
    "PE truba: suv tarmog'i loyihalari mart–iyunda eng faol. Hozir (sentabr) talab pasaygan, narx biroz tushgan.",
    "Kartoshka va piyoz: kuzgi yig'im davom etmoqda, narx past. Bahorda ombor zaxirasi kamayib narx ko'tariladi.",
    "Guruch: Xorazm yig'imi boshlanmoqda. Import guruch narxi dollar kursiga bog'liq.",
    "Bodring: sentabrda dala hosili tugayapti, narx asta-sekin ko'tarilib bormoqda. Qishda issiqxona narxi 2–3 baravar yuqori bo'ladi.",
]

SYSTEM_PROMPT = """Sen O'zbekiston ulgurji bozori uchun tovar narxlarini tahlil qiluvchi mutaxassissan.

Senga mahsulotning 24 oylik tarixiy narx ma'lumotlari, bozor profili, mavsum ma'lumotlari va yangiliklar beriladi.

Sening vazifang:
1. Tarixiy ma'lumotlar asosida kelgusi oylardagi narxni bashorat qilish
2. Mavsumiy o'zgarishlarni hisobga olish (qish/yoz, yig'im/ombor davrlari)
3. Bozor drayverlarini tahlil qilish
4. Xaridor va sotuvchiga aniq tavsiya berish

MUHIM QOIDALAR:
- Barcha tushuntirish matnlari FAQAT O'ZBEK TILIDA bo'lsin
- Narxlar real UZS qiymatlarida bo'lsin (hozirgi narxga yaqin)
- Har bir oy uchun low < price < high (ishonch oralig'i)
- Mavsumiy naqshlarni e'tiborsiz qoldirma — bu juda muhim
- Qisqa va aniq gaplar yoz, ortiqcha so'z ishlatma
- "confidence" qiymati: agar ma'lumot ko'p va trend aniq bo'lsa "yuqori", agar noaniqlik bo'lsa "o'rta", agar ma'lumot kam bo'lsa "past"
- "best_action" faqat shu 3 tadan biri: "Hozir olish", "Kutish", "Kuzatib turish"

JAVOB FORMATI NAMUNASI (faqat JSON qaytar, hech qanday qo'shimcha matnsiz):
{
  "predicted_points": [
    {"date": "2026-10", "price": 10500, "low": 9800, "high": 11200},
    {"date": "2026-11", "price": 12000, "low": 11100, "high": 13000},
    {"date": "2026-12", "price": 14500, "low": 13200, "high": 15800}
  ],
  "trend": "up",
  "explanation": {
    "direction": "Kelgusi 3 oyda narx ~55% ga ko'tarilishi kutilmoqda (9 200 dan 14 500 so'mgacha).",
    "seasonal": "Kuz-qish mavsumida dala hosili tugab, issiqxona mahsulotiga talab va xarajat oshadi.",
    "driver": "Asosiy omil — issiqxonalarni isitish energiya xarajatlari va qishki taklif kamayishi.",
    "recommendation": "Xaridorlarga zaxirani oktabr oyidayoq to'ldirish tavsiya etiladi."
  },
  "confidence": "yuqori",
  "best_action": "Hozir olish"
}"""


def _normalize_name(name: str) -> str:
    return name.replace("‘", "'").replace("’", "'").strip()


def _build_user_prompt(
    product_name: str,
    unit: str,
    current_price: float,
    history: list[tuple[str, float]],
    horizon: int,
) -> str:
    clean_name = _normalize_name(product_name)
    profile = MARKET_PROFILES.get(clean_name) or MARKET_PROFILES.get(product_name, {})
    hubs = profile.get("hubs", "Noma'lum")
    season = profile.get("season", "Noma'lum")
    drivers = ", ".join(profile.get("drivers", []))
    note = profile.get("note", "")

    history_lines = "\n".join(f"  {d}: {p:.0f} so'm" for d, p in history[-24:])

    # Filter relevant news
    kw = clean_name.lower().split()[0]
    relevant_news = [n for n in NEWS_CONTEXT if kw in _normalize_name(n).lower()]
    if not relevant_news:
        relevant_news = NEWS_CONTEXT[:3]
    news_lines = "\n".join(f"  - {n}" for n in relevant_news)

    today = date.today()
    future_months = []
    for i in range(1, horizon + 1):
        m = today.month + i
        y = today.year + (m - 1) // 12
        m = ((m - 1) % 12) + 1
        future_months.append(f"{y}-{m:02d}")

    return f"""Bugungi sana: {today.isoformat()}

Mahsulot: {product_name}
Birlik: {unit}
Hozirgi narx: {current_price:.0f} so'm/{unit}

Oxirgi 24 oylik narx tarixi (oylik o'rtacha, so'm/{unit}):
{history_lines}

Bozor profili:
- Asosiy markazlar: {hubs}
- Mavsumiylik: {season}
- Asosiy drayverlar: {drivers}
- Izoh: {note}

Bozor yangiliklari:
{news_lines}

VAZIFA: Kelgusi {horizon} oy ({', '.join(future_months)}) uchun narx bashoratini JSON formatida tuz."""


def _fallback_prediction(
    product_name: str,
    history: list[tuple[str, float]],
    horizon: int,
    current_price: float,
) -> PredictionRead:
    """LinearRegression fallback when OpenRouter is unavailable."""
    prices = [p for _, p in history[-24:]]
    if len(prices) < 3:
        prices = [current_price] * 6

    today = date.today()
    points: list[PredictionPoint] = []
    x = np.arange(len(prices))
    y = np.array(prices)

    try:
        from sklearn.linear_model import LinearRegression
        model = LinearRegression()
        model.fit(x.reshape(-1, 1), y)
        slope = float(model.coef_[0])
        intercept = float(model.intercept_)
    except ImportError:
        slope, intercept = np.polyfit(x, y, 1)

    for i in range(1, horizon + 1):
        m = today.month + i
        yr = today.year + (m - 1) // 12
        m = ((m - 1) % 12) + 1
        predicted = slope * (len(prices) + i - 1) + intercept
        predicted = max(100, predicted)
        band = max(predicted * 0.05, abs(slope) * 2)
        points.append(PredictionPoint(
            date=f"{yr}-{m:02d}",
            price=round(predicted),
            low=round(predicted - band),
            high=round(predicted + band),
        ))

    overall_change = (points[-1].price - current_price) / current_price * 100 if current_price else 0
    if overall_change > 2:
        trend = "up"
        direction = f"Kelgusi {horizon} oyda narx ~{abs(overall_change):.0f}% ga oshishi kutilmoqda."
    elif overall_change < -2:
        trend = "down"
        direction = f"Kelgusi {horizon} oyda narx ~{abs(overall_change):.0f}% ga tushishi kutilmoqda."
    else:
        trend = "flat"
        direction = f"Kelgusi {horizon} oyda narx barqaror qolishi kutilmoqda."

    profile = MARKET_PROFILES.get(_normalize_name(product_name)) or MARKET_PROFILES.get(product_name, {})

    return PredictionRead(
        product=product_name,
        horizon=horizon,
        predicted_points=points,
        trend=trend,
        explanation=PredictionExplanation(
            direction=direction,
            seasonal=f"Mavsum: {profile.get('season', 'noaniq')}.",
            driver=f"Asosiy omillar: {', '.join(profile.get('drivers', ['noaniq']))}.",
            recommendation="Batafsil tahlil uchun bozor yangiliklarini kuzating.",
        ),
        confidence="past",
        best_action="Kuzatib turish",
        disclaimer="Bu statistik trend tahlili. AI javob bermadi, chiziqli regressiya ishlatildi.",
    )


async def predict_price(
    product_name: str,
    unit: str,
    current_price: float,
    history: list[tuple[str, float]],
    horizon: int,
) -> PredictionRead:
    settings = get_settings()

    if not settings.openrouter_api_key:
        logger.info("OpenRouter key not configured, using fallback")
        return _fallback_prediction(product_name, history, horizon, current_price)

    user_prompt = _build_user_prompt(product_name, unit, current_price, history, horizon)

    try:
        async with httpx.AsyncClient(timeout=45.0) as client:
            resp = await client.post(
                OPENROUTER_URL,
                headers={
                    "Authorization": f"Bearer {settings.openrouter_api_key}",
                    "Content-Type": "application/json",
                    "HTTP-Referer": "https://marketch.uz",
                    "X-Title": "marketch.uz",
                },
                json={
                    "model": settings.openrouter_model,
                    "messages": [
                        {"role": "system", "content": SYSTEM_PROMPT},
                        {"role": "user", "content": user_prompt},
                    ],
                    "temperature": 0.3,
                    "max_tokens": 4000,
                    "response_format": {"type": "json_object"},
                },
            )
            resp.raise_for_status()
            data = resp.json()

        raw = data["choices"][0]["message"]["content"]
        # Clean potential markdown fences
        raw = raw.strip()
        if raw.startswith("```"):
            raw = raw.split("\n", 1)[1] if "\n" in raw else raw[3:]
        if raw.endswith("```"):
            raw = raw[:-3]
        raw = raw.strip()

        result = json.loads(raw)

        points = [
            PredictionPoint(
                date=str(p["date"]),
                price=round(float(p["price"])),
                low=round(float(p["low"])),
                high=round(float(p["high"])),
            )
            for p in result["predicted_points"]
        ]

        # Validate points
        for pt in points:
            if pt.low > pt.price:
                pt.low = round(pt.price * 0.93)
            if pt.high < pt.price:
                pt.high = round(pt.price * 1.07)

        expl = result.get("explanation", {})
        explanation = PredictionExplanation(
            direction=str(expl.get("direction", "Ma'lumot yetarli emas.")),
            seasonal=str(expl.get("seasonal", "Mavsum ta'siri noaniq.")),
            driver=str(expl.get("driver", "Asosiy omil aniqlanmadi.")),
            recommendation=str(expl.get("recommendation", "Bozorni kuzatib turing.")),
        )

        trend = result.get("trend", "flat")
        if trend not in ("up", "down", "flat"):
            trend = "flat"

        confidence = result.get("confidence", "o'rta")
        if confidence not in ("yuqori", "o'rta", "past"):
            confidence = "o'rta"

        best_action = result.get("best_action", "Kuzatib turish")
        if best_action not in ("Hozir olish", "Kutish", "Kuzatib turish"):
            best_action = "Kuzatib turish"

        return PredictionRead(
            product=product_name,
            horizon=horizon,
            predicted_points=points,
            trend=trend,
            explanation=explanation,
            confidence=confidence,
            best_action=best_action,
            disclaimer="Bu sun'iy intellekt tahlili. Aniq kafolat emas. Tarixiy ma'lumotlar qisman sintetik.",
        )

    except Exception as exc:
        logger.warning("OpenRouter prediction failed: %s, using fallback", exc)
        return _fallback_prediction(product_name, history, horizon, current_price)
