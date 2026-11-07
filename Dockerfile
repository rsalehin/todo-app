# Use Python 3.13
FROM python:3.13-slim

# Copy uv from its official Docker image
COPY --from=ghcr.io/astral-sh/uv:0.9.28 /uv /uvx /bin/

# Set working directory
WORKDIR /app

# Install dependencies first for Docker layer caching
COPY pyproject.toml uv.lock ./
RUN uv sync --locked --no-dev --no-install-project

# Copy application code
COPY app ./app
COPY scripts ./scripts

# Make the virtual environment available
ENV PATH="/app/.venv/bin:$PATH"

# Document the application port
EXPOSE 8000

# Start FastAPI
CMD ["fastapi", "run", "app/main.py", "--host", "0.0.0.0", "--port", "8000"]
