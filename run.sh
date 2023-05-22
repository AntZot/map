#! /usr/bin/bash
uvicorn src.back.main:app --host 0.0.0.0 --port 8000 --reload