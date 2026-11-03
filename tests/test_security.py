from app.security import hash_password, verify_password


def test_hast_is_not_password_and_verifies():
    hashed = hash_password("correct-horse-battery")
    assert hashed != "correct-horse-battery"
    assert hashed.startswith("$argon2id$")
    assert verify_password("correct-horse-battery", hashed)
    assert not verify_password("not-correct-horse-battery", hashed)


def test_same_passwords_hashed_differently():
    assert hash_password("same-password") != hash_password("same-password")
