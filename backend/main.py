from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import Base, engine
import models  # noqa: F401  (imported so that all tables are registered)
from auth import router as auth_router
from routes_recommend import router as recommend_router
from routes_services import router as services_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="I Perform You Deserve API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(recommend_router)
app.include_router(services_router)


@app.get("/")
def root():
    return {"status": "I Perform You Deserve API is running"}