#!/bin/bash

# Activate the virtual environment
source .venv/bin/activate

# Run python main.py and start celery in the background
sh -c "ENV_STAGE=$ENV_STAGE ./start_celery.sh & ENV_STAGE=$ENV_STAGE uvicorn app:app --reload"