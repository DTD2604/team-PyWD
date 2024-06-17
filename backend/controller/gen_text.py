from fastapi import APIRouter

gen_text_router = APIRouter(
    prefix="/genText",
    tags=["genText"]
)


@gen_text_router.get('/')
async def gen_text():
    return {"message": "Hello gent text"}
