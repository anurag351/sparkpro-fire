# app/services/id_service.py

import uuid
from datetime import datetime
from typing import Literal

# Define supported prefixes
VALID_PREFIXES = {
    "attendance": "AT",
    "leave": "LV",
    "project": "PJ",
    "audit": "AU",
}

def generate_unique_id(entity_type: Literal["employee", "attendance", "leave", "project", "audit"]) -> str:
    """
    Generate a globally unique, non-sequential ID with prefix.
    Format: <PREFIX>-<UUID Fragment>-<YYMMDD>
    Example: EM-7F3A8C21C9-251006
    """
    if entity_type not in VALID_PREFIXES:
        raise ValueError(f"Invalid entity type: {entity_type}")

    prefix = VALID_PREFIXES[entity_type]
    
    # Generate short random unique part
    unique_part = uuid.uuid4().hex[:10].upper()

    # Append date for traceability (optional)
    date_part = datetime.now().strftime("%y%m%d")

    return f"{prefix}-{unique_part}-{date_part}"
