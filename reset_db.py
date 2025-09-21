import asyncio
from app.core.database import engine, Base

async def reset_db():
    async with engine.begin() as conn:
        print("⚠️ Dropping all tables...")
        await conn.run_sync(Base.metadata.drop_all)   # 🔥 Drop all existing tables

        print("✅ Creating new tables...")
        await conn.run_sync(Base.metadata.create_all) # 🔥 Create fresh tables

    print("🎉 Database reset completed successfully!")

if __name__ == "__main__":
    asyncio.run(reset_db())
# To run this script, use: python reset_db.py
# This will drop all existing tables and recreate them based on the current models.