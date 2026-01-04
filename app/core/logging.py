import structlog

def setup_logging():
    structlog.configure(
        processors=[
            structlog.processors.JSONRenderer() # Логи в формате JSON для удобного поиска
        ]
    )

logger = structlog.get_logger()