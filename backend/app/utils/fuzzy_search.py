from rapidfuzz import fuzz, process

PRODUCT_ALIASES = {
    "tomato": ["tomato", "tomat", "pomidor", "помидор", "помидоры", "помидорлар"],
    "potato": ["potato", "kartoshka", "картошка", "картофель", "картошкалар"],
    "onion": ["onion", "piyoz", "лук", "луковица", "пиёз"],
    "cucumber": ["cucumber", "bodring", "огурец", "огурцы", "бодринг"],
    "apple": ["apple", "olma", "яблоко", "яблоки", "олма"],
}


def normalize_product_name(raw: str) -> str:
    text = " ".join(raw.strip().lower().replace("ё", "е").split())
    for canonical, aliases in PRODUCT_ALIASES.items():
        if text in aliases or text == canonical:
            return canonical.title()
    return raw.strip()


def fuzzy_match_product(query: str, product_names: list[str], cutoff: int = 72) -> str | None:
    if not query or not product_names:
        return None

    normalized = normalize_product_name(query)
    lowered = {name.lower(): name for name in product_names}
    if normalized.lower() in lowered:
        return lowered[normalized.lower()]

    alias_targets = []
    for canonical, aliases in PRODUCT_ALIASES.items():
        for alias in aliases:
            alias_targets.append((alias, canonical))

    alias_match = process.extractOne(
        query.lower(),
        [alias for alias, _ in alias_targets],
        scorer=fuzz.WRatio,
    )
    if alias_match and alias_match[1] >= cutoff:
        canonical = next(c for alias, c in alias_targets if alias == alias_match[0])
        for name in product_names:
            if name.lower() == canonical:
                return name

    name_match = process.extractOne(query, product_names, scorer=fuzz.WRatio)
    if name_match and name_match[1] >= cutoff:
        return name_match[0]
    return None
