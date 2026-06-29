from fastapi import APIRouter

router = APIRouter()

@router.post('/chat')
async def chat(payload: dict):
    return {'message': 'ok'}
