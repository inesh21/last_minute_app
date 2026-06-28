from datetime import datetime

from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    email: EmailStr
    name: str = ""
    google_sub: str | None = None


class UserRead(BaseModel):
    id: str
    email: EmailStr
    name: str
    google_sub: str | None
    created_at: datetime

    model_config = {"from_attributes": True}

