from enum import StrEnum


class UserRole(StrEnum):
    BUYER = "buyer"
    SELLER = "seller"
    BOTH = "both"


class OrderType(StrEnum):
    ASK = "ASK"
    BID = "BID"


class OfferStatus(StrEnum):
    ACTIVE = "active"
    CANCELLED = "cancelled"
    EXPIRED = "expired"
