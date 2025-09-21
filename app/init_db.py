# init_db.py
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

DB_NAME = "sparkpro"
DB_USER = "postgres"
DB_PASSWORD = "Anurag"
DB_HOST = "localhost"
DB_PORT = "5432"

TABLES_SQL = """
CREATE TABLE IF NOT EXISTS employees (
    serial_no INTEGER UNIQUE GENERATED ALWAYS AS IDENTITY,
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL,
    manager_id VARCHAR REFERENCES employees(id) ON DELETE SET NULL,
    contact VARCHAR(12)  NOT NULL,
    is_active BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS attendance (
    id SERIAL PRIMARY KEY,
    employee_id VARCHAR(10) REFERENCES employees(id) ON DELETE CASCADE,
    time_in TIMESTAMP NOT NULL,
    time_out TIMESTAMP,
    approved_by VARCHAR(10) REFERENCES employees(id),
    overtime_hours NUMERIC(5,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS leaves (
    id SERIAL PRIMARY KEY,
    employee_id VARCHAR(10) REFERENCES employees(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'Pending',
    approved_by VARCHAR(10) REFERENCES employees(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS salaries (
    id SERIAL PRIMARY KEY,
    employee_id VARCHAR NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    month VARCHAR(7) NOT NULL, -- format: YYYY-MM
    base_pay FLOAT DEFAULT 0.0,
    overtime_pay FLOAT DEFAULT 0.0,
    total_pay FLOAT DEFAULT 0.0,
    approved_by VARCHAR REFERENCES employees(id) ON DELETE SET NULL
);
CREATE TABLE IF NOT EXISTS project_assignments (
    id SERIAL PRIMARY KEY,
    project_id INT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    employee_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assigned_by VARCHAR NOT NULL REFERENCES users(id),
    approved_by VARCHAR REFERENCES users(id) ON DELETE SET NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE (employee_id) -- ensures one project per employee at a time
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(10) NOT NULL,
    action VARCHAR(50) NOT NULL,
    performed_by VARCHAR(10) REFERENCES employees(id),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    comments TEXT,
    old_data JSONB,
    new_data JSONB
);

CREATE TABLE IF NOT EXISTS password_reset_requests (
    id VARCHAR PRIMARY KEY,
    user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_by VARCHAR REFERENCES users(id) ON DELETE SET NULL,
    temporary_password VARCHAR,
    is_approved BOOLEAN DEFAULT FALSE,
    is_used BOOLEAN DEFAULT FALSE
);
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR NOT NULL,
    role VARCHAR(50) NOT NULL,  -- Employee, Manager, APD, PD, MD
    is_active BOOLEAN DEFAULT TRUE,
    is_temp_password BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS project_assignments (
    id SERIAL PRIMARY KEY,
    project_id INT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    employee_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assigned_by VARCHAR NOT NULL REFERENCES users(id),
    approved_by VARCHAR REFERENCES users(id),
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE (employee_id)  -- ensures one project per employee
);

"""

def create_database():
    conn = psycopg2.connect(
        dbname="postgres",
        user=DB_USER,
        password=DB_PASSWORD,
        host=DB_HOST,
        port=DB_PORT
    )
    conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    cur = conn.cursor()

    cur.execute(f"SELECT 1 FROM pg_database WHERE datname = '{DB_NAME}';")
    exists = cur.fetchone()

    if not exists:
        cur.execute(f"CREATE DATABASE {DB_NAME};")
        print(f"✅ Database '{DB_NAME}' created")
    else:
        print(f"ℹ️ Database '{DB_NAME}' already exists")

    cur.close()
    conn.close()

def create_tables():
    conn = psycopg2.connect(
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
        host=DB_HOST,
        port=DB_PORT
    )
    cur = conn.cursor()
    cur.execute(TABLES_SQL)
    conn.commit()
    cur.close()
    conn.close()
    print("✅ Tables ensured in database")

def init_db():
    create_database()
    create_tables()
