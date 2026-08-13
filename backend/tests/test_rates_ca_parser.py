from backend.app.providers.rates_ca import RatesCaProvider


def test_parses_public_quote_card():
    text = """
    Recent auto Insurance Quote from Kingston, Ontario
    Female, 26 years old
    2025 TOYOTA COROLLA CROSS SE HEV 4DR AWD
    July 27, 2026
    Cheapest Quote
    $ 136 / month
    $ 1,628 / year
    """
    samples = RatesCaProvider._parse_samples(text)
    assert samples == [{
        "city": "Kingston, Ontario", "gender": "Female", "age": 26,
        "year": 2025, "vehicle": "TOYOTA COROLLA CROSS SE HEV 4DR AWD",
        "monthly": 136, "annual": 1628,
    }]
