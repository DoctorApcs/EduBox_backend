from fastapi import FastAPI
from dotenv import load_dotenv
from api.routes.knowledge_base import kb_router
from fastapi.middleware.cors import CORSMiddleware
from celery.result import AsyncResult
from fastapi.responses import JSONResponse


load_dotenv(override=True)
app = FastAPI()

@app.get("/")
async def root():
    return {
        "message": "Hello World!",
    }


@app.get("/api/task_status/{task_id}")
async def get_task_status(task_id: str):
    task_result = AsyncResult(task_id)
    if task_result.ready():
        if task_result.successful():
            return JSONResponse(
                content={
                    "status": "completed",
                    "result": task_result.result
                }
            )
        else:
            return JSONResponse(
                content={
                    "status": "failed",
                    "error": str(task_result.result)
                },
                status_code=500
            )
    else:
        return JSONResponse(
            content={
                "status": "in_progress"
            }
        )
        

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)


app.include_router(kb_router, prefix="/api/knowledge_base")