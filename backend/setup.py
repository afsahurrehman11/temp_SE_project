#!/usr/bin/env python3
"""
Setup script for ResumeMatch Backend API
Helps configure the environment and initialize the database
"""

import os
import secrets
import sys
from pathlib import Path


def generate_secret_key():
    """Generate a secure secret key"""
    return secrets.token_urlsafe(32)


def create_env_file():
    """Create .env file from template if it doesn't exist"""
    env_path = Path(".env")
    env_example_path = Path(".env.example")
    
    if env_path.exists():
        print("✓ .env file already exists")
        return
    
    if not env_example_path.exists():
        print("✗ .env.example not found")
        return
    
    print("Creating .env file from template...")
    
    # Read template
    with open(env_example_path, 'r') as f:
        content = f.read()
    
    # Generate secret key
    secret_key = generate_secret_key()
    content = content.replace("your-secret-key-here", secret_key)
    
    # Get user input for key settings
    print("\n🔧 Configuration Setup")
    print("-" * 50)
    
    # Database URL
    db_url = input("Enter PostgreSQL DATABASE_URL (or press Enter for default): ").strip()
    if not db_url:
        db_url = "postgresql://postgres:postgres@localhost:5432/resumematch"
    content = content.replace(
        "postgresql://user:password@localhost:5432/resumematch",
        db_url
    )
    
    # HuggingFace token
    hf_token = input("Enter your HuggingFace API Token (required): ").strip()
    if hf_token:
        content = content.replace("your_huggingface_token_here", hf_token)
    else:
        print("⚠️  Warning: HuggingFace token is required for AI features")
    
    # Write .env file
    with open(env_path, 'w') as f:
        f.write(content)
    
    print("\n✓ .env file created successfully")


def create_directories():
    """Create necessary directories"""
    directories = [
        "uploads",
        "vector_stores",
        "logs"
    ]
    
    print("\n📁 Creating directories...")
    for directory in directories:
        path = Path(directory)
        path.mkdir(exist_ok=True)
        print(f"✓ Created {directory}/")


def check_dependencies():
    """Check if all required packages are installed"""
    print("\n📦 Checking dependencies...")
    
    required_packages = [
        "fastapi",
        "uvicorn",
        "sqlalchemy",
        "psycopg2",
        "langchain",
        "transformers",
        "sentence_transformers",
        "faiss-cpu",
        "pypdf",
        "python-jose",
        "passlib"
    ]
    
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package.replace("-", "_"))
            print(f"✓ {package}")
        except ImportError:
            print(f"✗ {package} (missing)")
            missing_packages.append(package)
    
    if missing_packages:
        print(f"\n⚠️  Missing packages: {', '.join(missing_packages)}")
        print("Run: pip install -r requirements.txt")
        return False
    
    print("\n✓ All dependencies installed")
    return True


def test_database_connection():
    """Test database connection"""
    print("\n🔌 Testing database connection...")
    
    try:
        from app.database import engine
        from sqlalchemy import text
        
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            result.fetchone()
        
        print("✓ Database connection successful")
        return True
    except Exception as e:
        print(f"✗ Database connection failed: {e}")
        print("\nMake sure PostgreSQL is running and credentials are correct.")
        return False


def create_tables():
    """Create database tables"""
    print("\n🗄️  Creating database tables...")
    
    try:
        from app.database import Base, engine
        
        Base.metadata.create_all(bind=engine)
        print("✓ Database tables created successfully")
        return True
    except Exception as e:
        print(f"✗ Failed to create tables: {e}")
        return False


def print_next_steps():
    """Print next steps for the user"""
    print("\n" + "=" * 50)
    print("🎉 Setup Complete!")
    print("=" * 50)
    print("\nNext steps:")
    print("1. Review your .env file and update any settings")
    print("2. Make sure PostgreSQL is running")
    print("3. Start the development server:")
    print("   uvicorn app.main:app --reload")
    print("\n4. Visit http://localhost:8000/api/docs for API documentation")
    print("\n5. Create your first user account:")
    print('   curl -X POST "http://localhost:8000/api/v1/auth/register" \\')
    print('     -H "Content-Type: application/json" \\')
    print('     -d \'{"email": "admin@example.com", "username": "admin", "password": "admin123", "full_name": "Admin User"}\'')
    print("\n" + "=" * 50)


def main():
    """Main setup function"""
    print("=" * 50)
    print("ResumeMatch Backend API Setup")
    print("=" * 50)
    
    # Create .env file
    create_env_file()
    
    # Create directories
    create_directories()
    
    # Check dependencies
    deps_ok = check_dependencies()
    if not deps_ok:
        print("\n⚠️  Please install missing dependencies before continuing")
        sys.exit(1)
    
    # Test database connection
    db_ok = test_database_connection()
    if db_ok:
        # Create tables
        create_tables()
    else:
        print("\n⚠️  Skipping table creation due to database connection issues")
    
    # Print next steps
    print_next_steps()


if __name__ == "__main__":
    main()
