from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_db, limit_chat
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.ai_service import explain_market, parse_intent
from app.services.forecast_service import forecast_product
from app.services.market_service import market_summary
from app.services.search_service import search_from_intent

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("", response_model=ChatResponse)
def chat(
    payload: ChatRequest,
    db: Session = Depends(get_db),
    _: None = Depends(limit_chat),
) -> ChatResponse:
    intent, used_llm_intent = parse_intent(payload.message)
    offers: list[dict] = []
    context: dict = {"intent": intent.model_dump(mode="json")}

    if intent.product:
        try:
            search = search_from_intent(db, intent)
            offers = search.get("offers", [])
            context["search"] = {
                "tier": search.get("tier"),
                "product": search.get("product"),
                "offer_count": len(offers),
                "top_offers": offers[:3],
            }
            context["summary"] = market_summary(db, intent.product, intent.region).model_dump(mode="json")
            context["forecast"] = forecast_product(db, intent.product, intent.region).model_dump(mode="json")
        except ValueError:
            context["note"] = "Product or region not found in catalog"

    reply, used_llm_chat = explain_market(payload.message, context)
    return ChatResponse(
        reply=reply,
        intent=intent,
        used_llm=used_llm_intent or used_llm_chat,
        offers=offers[:8],
    )
