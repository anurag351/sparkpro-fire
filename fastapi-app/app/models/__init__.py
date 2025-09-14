# This file is intentionally left blank.
# app/models/__init__.py
# Import models so alembic / create_all can find them
from .employee import Employee
from .attendance import Attendance
from .leave import Leave
from .salary import Salary
from .audit import AuditLog
from .user import User  # optional user table if you want auth DB table
