import os
from celery import Celery
# from kombu import Queue
# import logging
# Get the ENV_STAGE and QUEUE_NAME from environment variables
# env_stage = int(os.getenv('ENV_STAGE', '1'))
# queue_name = os.getenv('QUEUE_NAME', 'bachngo_kb_worker_local')

celery = Celery('document_parser', 
                broker='redis://localhost:6379/0',
                include=[
                    "src.tasks.document_parser_tasks",
                ])


# Optional: Configure Celery
celery.conf.update(
    result_backend='redis://localhost:6379/0',
    task_serializer='json',
    result_serializer='json',
    accept_content=['json'],
    timezone='UTC',
    enable_utc=True,
)