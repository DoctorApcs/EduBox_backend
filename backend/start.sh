# Run python main.py and start celery in the background
bash -c "celery -A src worker --loglevel=info & python app.py"