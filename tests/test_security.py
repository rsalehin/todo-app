from datetime import timedelta

import jwt
import pytest

from app.config import settings
from app.security import create_access_token, decode_access_token, hash_password, verify_password


def test_hast_is_not_password_and_verifies():
    hashed = hash_password("correct-horse-battery")
    assert hashed != "correct-horse-battery"
    assert hashed.startswith("$argon2id$")
    assert verify_password("correct-horse-battery", hashed)
    assert not verify_password("not-correct-horse-battery", hashed)


def test_same_passwords_hashed_differently():
    assert hash_password("same-password") != hash_password("same-password")


def test_token_is_three_parts_and_readable_without_key():
    token = create_access_token(subject="42")
    assert token.count(".") == 2
    payload = jwt.decode(token, options={"verify_signature": False})
    assert payload["sub"] == "42"
    assert payload["exp"] - payload["iat"] == 20 * 60


def test_token_round_trip():
    token = create_access_token(subject="42")
    payload = decode_access_token(token)
    assert payload["sub"] == "42"
    assert payload["exp"] > payload["iat"]


def test_expired_token_is_rejected():
    token = create_access_token(subject="42", expires_delta=timedelta(seconds=-1))
    with pytest.raises(jwt.ExpiredSignatureError):
        decode_access_token(token)


def test_tempered_token_is_expired():
    header, payload, signature = create_access_token(subject="42").split(".")
    forged_payload = create_access_token(subject="1").split(".")[1]
    with pytest.raises(jwt.InvalidSignatureError):
        decode_access_token(f"{header}.{forged_payload}.{signature}")


def test_token_signed_with_another_key_is_rejected():
    token = jwt.encode({"sub": "42"}, "another-key-that-is-32-bytes-long!", algorithm="HS256")
    with pytest.raises(jwt.InvalidSignatureError):
        decode_access_token(token)


def test_unsigned_token_is_rejected():
    token = jwt.encode({"sub": "42"}, key=None, algorithm=None)
    with pytest.raises(jwt.InvalidAlgorithmError):
        decode_access_token(token)


def test_token_without_expiry_is_rejected():
    token = jwt.encode({"sub": "42"}, settings.secret_key, algorithm="HS256")
    with pytest.raises(jwt.MissingRequiredClaimError):
        decode_access_token(token)
