#!/usr/bin/env bash
# Creates tools/.cache/extvenv with the third-party libraries whose API reference is
# included in the app (docstrings are introspected, examples are executed at build time).
# Afterwards build the knowledge bases with:
#   TF_CPP_MIN_LOG_LEVEL=3 tools/.cache/extvenv/bin/python tools/build_content.py
# Without this step tools/build_content.py still works with a plain python3.11: the
# external-library sections are then built from the curated text only.
set -euo pipefail
cd "$(dirname "$0")"
python3.11 -m venv .cache/extvenv
.cache/extvenv/bin/pip install --upgrade pip
.cache/extvenv/bin/pip install numpy pandas matplotlib requests beautifulsoup4 flask django fastapi httpx \
    pygame pillow scikit-learn sqlalchemy selenium pytest opencv-python-headless tensorflow-cpu
.cache/extvenv/bin/pip install torch --index-url https://download.pytorch.org/whl/cpu
