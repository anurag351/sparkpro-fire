import logging

# Configure root logger
logging.basicConfig(
    level=logging.DEBUG,  # Change to INFO in production
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)

logger = logging.getLogger("sparkpro")
