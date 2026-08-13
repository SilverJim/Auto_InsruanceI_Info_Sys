from __future__ import annotations

from .base import QuoteProvider
from .rates_ca import RatesCaProvider


PROVIDERS: dict[str, QuoteProvider] = {
    "rates_ca": RatesCaProvider(),
}

# Planned adapters preserve route identity and overlap semantics. They are not
# reported as queried until a concrete provider implementation is registered.
PLANNED_ROUTES = {
    "lowest_rates": {"kind": "aggregator", "overlaps": ["rates_ca"]},
    "surex": {"kind": "licensed_broker", "handoff": "callback"},
    "think_insure": {"kind": "licensed_broker", "handoff": "advisor"},
    "onlia": {"kind": "digital_broker", "capture": "legal_underwriter"},
    "scoop": {"kind": "digital_broker", "handoff": "callback"},
    "pc_insurance": {"kind": "branded_broker", "capture": "legal_underwriter"},
    "inova": {"kind": "affinity_broker", "requires": "membership"},
    "insurance_hotline": {"kind": "lead_network", "not_underwriter": True},
}


def get_provider(provider_id: str) -> QuoteProvider:
    try:
        return PROVIDERS[provider_id]
    except KeyError as exc:
        raise ValueError(f"Unsupported provider: {provider_id}") from exc
