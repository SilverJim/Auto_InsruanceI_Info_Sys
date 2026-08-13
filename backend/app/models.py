from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field


class QuoteRequest(BaseModel):
    firstName: str = ""
    lastName: str = ""
    birthDate: str = ""
    postalCode: str
    licenceClass: str = "G"
    firstLicensed: str = ""
    vehicleYear: str
    make: str
    model: str
    annualKm: str = "12000"
    use: str = "Commute"
    claims: str = "0"
    convictions: str = "0"
    currentInsurer: str = ""
    liability: str = "$2,000,000"
    deductible: str = "$1,000"
    effectiveDate: str = ""
    consent: bool = False


class QuoteResult(BaseModel):
    id: str
    brand: str
    initials: str
    color: str = "navy"
    underwriter: str
    sourceId: str
    annual: int | None = None
    monthly: int | None = None
    fee: int = 0
    liability: str = "Unknown"
    deductible: str = "Unknown"
    dcpd: bool | None = None
    opcf44: bool | None = None
    comparable: bool = False
    verified: bool = True
    exact: bool = False
    status: Literal[
        "quoted_comparable", "quoted_non_comparable", "estimate_only",
        "manual_handoff", "blocked", "unresolved"
    ]
    statusLabel: str
    differences: list[str] = Field(default_factory=list)
    reference: str
    confidence: Literal["High", "Medium", "Low"] = "Low"
    evidenceUrl: str
    capturedAt: str
    sourceRoute: str
    sampleProfile: str = ""


class QuoteResponse(BaseModel):
    quotes: list[QuoteResult]
    source: str
    mode: str
    notice: str
