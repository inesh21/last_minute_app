from fastapi import APIRouter

router = APIRouter()

@router.get('/summary')
async def summary():
    return {'feature': 'dashboard', 'status': 'ok'}
