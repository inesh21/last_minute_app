from fastapi import APIRouter

router = APIRouter()

@router.get('/events')
async def events():
    return []
