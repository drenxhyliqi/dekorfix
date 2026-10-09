"""Command-line tasks.

    python -m app.cli create-admin --email you@example.com --name "Your Name"
    python -m app.cli set-password --email you@example.com
    python -m app.cli seed-demo [--clear]

Passwords are asked for interactively (never passed on the command line).
Changing a password signs that user out everywhere. seed-demo fills an empty
development database with clearly marked demo orders and messages (names
"Demo …", emails @demo.invalid) to preview the admin dashboard; --clear removes
exactly those again. It refuses to run in production.
"""

import argparse
import getpass
import random
import sys
from datetime import UTC, datetime, timedelta

from sqlalchemy import delete, select

from app.core.config import get_settings
from app.core.database import SessionLocal
from app.core.security import hash_password
from app.models.contact_message import ContactMessage, ContactTopic
from app.models.order import Order, OrderItem, OrderStatus
from app.models.user import User
from app.repositories.users import UserRepository
from app.utils.references import new_reference

MIN_PASSWORD = 12


def ask_password() -> str:
    password = getpass.getpass("Password: ")
    if len(password) < MIN_PASSWORD:
        sys.exit(f"The password needs at least {MIN_PASSWORD} characters.")
    if getpass.getpass("Repeat password: ") != password:
        sys.exit("The passwords do not match.")
    return password


def create_admin(email: str, name: str) -> None:
    password = ask_password()
    with SessionLocal() as session:
        users = UserRepository(session)
        if users.by_email(email):
            sys.exit(f"A user with {email} already exists.")
        users.add(User(email=email.lower(), name=name, password_hash=hash_password(password)))
    print(f"Admin {email} created.")


def set_password(email: str) -> None:
    with SessionLocal() as session:
        user = UserRepository(session).by_email(email)
        if not user:
            sys.exit(f"No user with {email}.")
        user.password_hash = hash_password(ask_password())
        user.sessions.clear()
        session.commit()
    print(f"Password changed for {email}; existing sessions were signed out.")


DEMO_DOMAIN = "demo.invalid"
DEMO_PRODUCTS = [
    ("cerafix", "Cerafix"),
    ("baza", "Baza"),
    ("styrofix", "Styrofix"),
    ("fasader", "Fasader"),
    ("premium", "Premium"),
    ("confix", "Confix"),
    ("gletex", "Gletex"),
    ("fiberglass-mesh-red", "Fiberglass Mesh Red"),
    ("beton-kontakt", "Beton Kontakt"),
    ("fasadex", "Fasadex"),
]
DEMO_CITIES = [
    "Prizren",
    "Suharekë",
    "Ferizaj",
    "Gjakovë",
    "Podujevë",
    "Drenas",
    "Klinë",
    "Malishevë",
]
DEMO_MESSAGES = [
    "Sa pako Baza më duhen për 120 m² fasadë?",
    "A keni Cerafix në dispozicion këtë javë?",
    "Dua një ofertë për izolim të një shtëpie dykatëshe.",
    "A e dërgoni mallin në Prizren?",
    "Interesohemi për shpërndarje të produkteve tuaja në Zvicër.",
    "Cila ngjyrë fasade rekomandohet për anën veriore?",
]


def seed_demo(clear: bool) -> None:
    if get_settings().is_production:
        sys.exit("seed-demo is for development databases only.")
    with SessionLocal() as session:
        session.execute(delete(Order).where(Order.email.like(f"%@{DEMO_DOMAIN}")))
        session.execute(delete(ContactMessage).where(ContactMessage.email.like(f"%@{DEMO_DOMAIN}")))
        session.commit()
        if clear:
            print("Demo orders and messages removed.")
            return

        rng = random.Random(7)
        now = datetime.now(UTC)
        taken: set[str] = set(session.scalars(select(Order.reference)))
        taken |= set(session.scalars(select(ContactMessage.reference)))

        def reference(prefix: str) -> str:
            ref = new_reference(prefix, lambda candidate: candidate in taken)
            taken.add(ref)
            return ref

        def when(max_days: int) -> datetime:
            # More activity recently: a gentle upward trend.
            return now - timedelta(days=max_days * rng.random() ** 1.6, hours=rng.random() * 10)

        for i in range(64):
            created = when(90)
            age = (now - created).days
            status = (
                OrderStatus.NEW
                if age < 4
                else rng.choice(
                    [
                        OrderStatus.CONFIRMED,
                        OrderStatus.COMPLETED,
                        OrderStatus.COMPLETED,
                        OrderStatus.CANCELLED,
                    ]
                )
            )
            pickup = rng.random() < 0.3
            picks = rng.sample(DEMO_PRODUCTS, rng.randint(1, 3))
            session.add(
                Order(
                    reference=reference("DF"),
                    status=status,
                    created_at=created,
                    locale="sq",
                    customer_name=f"Demo Klienti {i + 1}",
                    phone="+383 44 000 000",
                    email=f"klienti{i + 1}@{DEMO_DOMAIN}",
                    delivery_method="pickup" if pickup else "delivery",
                    city=None if pickup else rng.choice(DEMO_CITIES),
                    address=None if pickup else "Adresë demo",
                    items=[
                        OrderItem(
                            product_slug=slug,
                            product_name=name,
                            pack_kg=None,
                            quantity=rng.randint(2, 40),
                        )
                        for slug, name in picks
                    ],
                )
            )
        topics = list(ContactTopic)
        for i in range(42):
            created = when(90)
            session.add(
                ContactMessage(
                    reference=reference("DM"),
                    status="new"
                    if (now - created).days < 3
                    else rng.choice(["answered", "closed"]),
                    created_at=created,
                    locale="sq",
                    name=f"Demo Vizitori {i + 1}",
                    email=f"vizitori{i + 1}@{DEMO_DOMAIN}",
                    topic=rng.choices(topics, weights=[5, 4, 2, 1, 1])[0],
                    message=rng.choice(DEMO_MESSAGES),
                )
            )
        session.commit()
    print("Demo data added: 64 orders and 42 messages over the last 90 days.")


def main() -> None:
    parser = argparse.ArgumentParser(prog="python -m app.cli")
    commands = parser.add_subparsers(dest="command", required=True)
    admin = commands.add_parser("create-admin", help="Create an admin user.")
    admin.add_argument("--email", required=True)
    admin.add_argument("--name", required=True)
    password = commands.add_parser("set-password", help="Change a user's password.")
    password.add_argument("--email", required=True)
    demo = commands.add_parser("seed-demo", help="Add (or --clear) demo orders and messages.")
    demo.add_argument("--clear", action="store_true")
    args = parser.parse_args()
    if args.command == "create-admin":
        create_admin(args.email, args.name)
    elif args.command == "set-password":
        set_password(args.email)
    elif args.command == "seed-demo":
        seed_demo(args.clear)


if __name__ == "__main__":
    main()
