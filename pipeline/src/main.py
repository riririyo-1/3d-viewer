
from fastapi import FastAPI
from src.presentation.routers import conversion, health
from src.config.settings import settings

app = FastAPI(
    title="Studio View Pipeline",
    version="1.0.0",
    description="3Dモデル変換パイプライン API",
)


# -- ルートエンドポイント --------------
@app.get("/", tags=["Root"])
def get_info():
    return {
        "name": "Studio View Pipeline",
        "version": "1.0.0",
        "description": "3Dモデル変換パイプライン API",
        "endpoints": {
            "docs": "/docs",
            "health": "/health/",
            "conversion": "/conversion",
        },
    }


app.include_router(health.router, prefix="/health", tags=["health"])
app.include_router(conversion.router, prefix="/conversion", tags=["conversion"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=settings.PORT)
