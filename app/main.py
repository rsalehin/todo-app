import logging
import re
import time
import uuid
from collections.abc import AsyncIterator, Awaitable, Callable
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, Response

from app.config import settings
from app.database import Base, engine
from app.logging_config import configure_logging
from app.routers import admin, auth, todos, users

configure_logging(settings.log_level)
logger = logging.getLogger("app.request")
SAFE_REQUEST_ID = re.compile(r"[A-Za-z0-9-]{1,64}")


@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncIterator[None]:
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(title=settings.app_name, lifespan=lifespan)
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(todos.router)
app.include_router(admin.router)


def choose_request_id(request: Request) -> str:
    incoming = request.headers.get("X-Request-ID", "")
    if SAFE_REQUEST_ID.fullmatch(incoming):
        return incoming
    return uuid.uuid4().hex


@app.middleware("http")
async def log_requests(
    request: Request, call_next: Callable[[Request], Awaitable[Response]]
) -> Response:
    request_id = choose_request_id(request)

    start = time.perf_counter()
    response = await call_next(request)
    duration_ms = (time.perf_counter() - start) * 1000

    response.headers["X-Request-ID"] = request_id
    logger.info(
        "%s %s -> %d (%.1f ms) [%s]",
        request.method,
        request.url.path,
        response.status_code,
        duration_ms,
        request_id,
    )
    return response


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
