# Run the same checks as GitHub CI, in the same order. Stops at the first failure.
# Usage (from the repository root):  .\scripts\check.ps1
#                    with Docker:    .\scripts\check.ps1 -Stack

param([switch]$Stack)

function Step([string]$Title, [scriptblock]$Command) {
    Write-Host "==> $Title" -ForegroundColor Cyan
    & $Command
    if ($LASTEXITCODE -ne 0) {
        Write-Host "FAILED: $Title" -ForegroundColor Red
        exit 1
    }
}

# Backend (the "checks" job)
Step "Backend lint" { uv run ruff check . }
Step "Backend format" { uv run ruff format --check . }
Step "Backend types" { uv run mypy }
Step "Backend tests" { uv run pytest --cov }

# Frontend (the "frontend" and "e2e" jobs)
Push-Location frontend
Step "Frontend lint" { npm run lint }
Step "Frontend format" { npm run format:check }
Step "Frontend types" { npm run typecheck }
Step "Frontend tests" { npm test }
Step "Frontend build" { npm run build }
Step "E2E (dev servers)" { npm run e2e }
Pop-Location

# The full stack (the "stack" job) - only with -Stack, because it needs Docker and takes minutes
if ($Stack) {
    Step "Start the stack" { docker compose up --build --detach --wait }
    Step "Smoke test" { uv run python scripts/smoke_test.py http://localhost:8080/api }
    Step "Seed E2E admin" { docker compose exec -T api python -m scripts.e2e_create_admin }
    Push-Location frontend
    $env:E2E_BASE_URL = "http://localhost:8080"
    Step "E2E (stack)" { npm run e2e }
    Remove-Item Env:E2E_BASE_URL
    Pop-Location
    docker compose down
}

Write-Host "All checks passed." -ForegroundColor Green
