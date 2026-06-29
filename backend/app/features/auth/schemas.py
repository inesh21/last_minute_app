from pydantic import BaseModel

class UserCreate(BaseModel):
    email: str
    name: str

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    created_at: str
