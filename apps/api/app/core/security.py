"""Password hashing and session tokens, using only the standard library.

Passwords are hashed with scrypt and a random salt per password. A session
token is a random value given to the browser once; only its SHA-256 hash is
stored, so a leaked database does not leak usable sessions.
"""

import hashlib
import hmac
import secrets

_SCRYPT = {"n": 2**14, "r": 8, "p": 1}
_SCHEME = "scrypt"


def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    digest = hashlib.scrypt(password.encode(), salt=salt, dklen=32, **_SCRYPT)
    return f"{_SCHEME}${_SCRYPT['n']}${_SCRYPT['r']}${_SCRYPT['p']}${salt.hex()}${digest.hex()}"


def verify_password(password: str, stored: str) -> bool:
    try:
        scheme, n, r, p, salt, digest = stored.split("$")
        if scheme != _SCHEME:
            return False
        candidate = hashlib.scrypt(
            password.encode(), salt=bytes.fromhex(salt), dklen=32, n=int(n), r=int(r), p=int(p)
        )
    except ValueError:
        return False
    return hmac.compare_digest(candidate.hex(), digest)


# Checked against when the email is unknown, so a wrong email takes as long as a wrong password.
DUMMY_HASH = hash_password(secrets.token_urlsafe(16))


def new_session_token() -> tuple[str, str]:
    """A token for the browser and the hash to store."""
    token = secrets.token_urlsafe(32)
    return token, hash_token(token)


def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()
