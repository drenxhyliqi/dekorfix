import secrets
from collections.abc import Callable

# No 0/O or 1/I, so a reference read out over the phone is unambiguous.
REFERENCE_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"


def new_reference(prefix: str, exists: Callable[[str], bool]) -> str:
    """A short random reference such as "DF-7K2Q9M" that `exists` has not seen yet."""
    while True:
        reference = f"{prefix}-" + "".join(secrets.choice(REFERENCE_ALPHABET) for _ in range(6))
        if not exists(reference):
            return reference
