# Repository Guidelines

## Project Structure & Module Organization
- Root entry: `main.ps1` orchestrates local setup and runs tools.
- Core tool: `dp_debug.py` (reverse/debug workflow).
- Feature modules: `cloudflare/` (bypass helpers), `plugin/` (Chrome extensions), `js/` (utility scripts), `config/` (JSON settings).
- Tests live in `tests/` (create if missing). Name files `test_*.py` and mirror feature folders.

## Build, Test, and Development Commands
- Create venv (Windows, PowerShell): `python -m venv .venv; .\.venv\Scripts\Activate.ps1`
- Install runtime deps: `pip install DrissionPage`
- Run main tool: `python dp_debug.py`
- Run Cloudflare helper: `python cloudflare\main.py`
- Orchestrate via PowerShell: `./main.ps1`
- Run tests (pytest): `pytest -q` (fallback: `python -m unittest discover -s tests`)

## Coding Style & Naming Conventions
- Python: PEP 8, 4-space indent. `snake_case` for modules/functions, `PascalCase` for classes, `UPPER_SNAKE_CASE` for constants. Keep functions small with early returns.
- JavaScript/JSON (plugins): 2-space indent, single quotes preferred in JS, no trailing commas in JSON.
- Logging: clear, structured, no emojis or extra blank lines. Prefer actionable error messages.

## Testing Guidelines
- Framework: `pytest` preferred; `unittest` acceptable. Place all tests under `tests/`.
- Naming: files `test_*.py`, tests `test_*` functions, arrange Arrange–Act–Assert.
- Coverage: prioritize critical paths in `dp_debug.py` and `cloudflare/`. Add fakes/mocks for network or browser calls.

## Commit & Pull Request Guidelines
- Commits: imperative, concise, scoped. Examples: `cloudflare: improve challenge handling`, `plugin/dp_helper: fix selector parsing`.
- PRs: include summary, motivation, test steps, and screenshots/GIFs for plugin UI changes. Link issues and list breaking changes explicitly.
- Single responsibility per PR; avoid mixed refactors.

## Windows & Configuration Tips
- Use PowerShell on Windows 11. Prefer UTF-8 with CRLF endings.
- Configure paths via `config/*.json`. Do not commit secrets or local browser paths—add samples and document overrides.
- Quote paths with spaces and use `Join-Path` in scripts when applicable.

