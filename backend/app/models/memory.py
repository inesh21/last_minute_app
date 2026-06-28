from datetime import datetime
from uuid import uuid4

from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database.session import Base


class AIMemory(Base):
    __tablename__ = "ai_memory"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid4()))
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True)
    key: Mapped[str] = mapped_column(String, index=True)
    value: Mapped[str] = mapped_column(Text)
    confidence: Mapped[str] = mapped_column(String, default="medium")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

