#!/usr/bin/env python3
"""Start both the FastAPI backend and Vite frontend dev servers."""

import subprocess
import sys
import os
import signal

ROOT = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.join(ROOT, "frontend")
VENV_PYTHON = os.path.join(ROOT, "venv", "bin", "python")


def main():
    python = VENV_PYTHON if os.path.exists(VENV_PYTHON) else sys.executable

    backend = subprocess.Popen(
        [python, "-m", "uvicorn", "backend.main:app", "--reload", "--port", "8000"],
        cwd=ROOT,
    )

    frontend = subprocess.Popen(
        ["npm", "run", "dev"],
        cwd=FRONTEND_DIR,
    )

    def shutdown(sig, frame):
        backend.terminate()
        frontend.terminate()
        sys.exit(0)

    signal.signal(signal.SIGINT, shutdown)
    signal.signal(signal.SIGTERM, shutdown)

    try:
        backend.wait()
    finally:
        frontend.terminate()
        backend.terminate()


if __name__ == "__main__":
    main()
