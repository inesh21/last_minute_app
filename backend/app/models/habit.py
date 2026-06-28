from datetime import datetime
from uuid import uuid4

from sqlalchemy import DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database.session import Base


class Habit(Base):
    __tablename__ = "habits"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid4()))
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True)
    name: Mapped[str] = mapped_column(String)
    cadence: Mapped[str] = mapped_column(String, default="daily")
    target_minutes: Mapped[int] = mapped_column(Integer, default=15)
    preferred_window: Mapped[str] = mapped_column(String, default="anytime")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

