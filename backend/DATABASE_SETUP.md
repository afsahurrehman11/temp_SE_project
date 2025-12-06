# Database Setup Guide

## Quick Setup (Automated)

Run the automated setup script:

```bash
cd /home/haseeb-raza/Desktop/resume-screening/backend
./setup_database.sh
```

This script will:
- ✅ Install PostgreSQL (if not installed)
- ✅ Start PostgreSQL service
- ✅ Create `resumematch` database
- ✅ Test database connection

---

## Manual Setup (Step by Step)

### 1. Install PostgreSQL

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

### 2. Start PostgreSQL Service

```bash
sudo systemctl start postgresql
sudo systemctl enable postgresql  # Enable auto-start on boot
```

### 3. Verify PostgreSQL is Running

```bash
sudo systemctl status postgresql
```

You should see: `Active: active (running)`

### 4. Create Database

```bash
sudo -u postgres createdb resumematch
```

### 5. Test Connection

```bash
sudo -u postgres psql -d resumematch
```

If successful, you'll see the PostgreSQL prompt: `resumematch=#`

Type `\q` to exit.

### 6. (Optional) Set Password for postgres User

```bash
sudo -u postgres psql
```

In the PostgreSQL prompt:

```sql
ALTER USER postgres PASSWORD 'postgres';
\q
```

---

## Environment Configuration

Make sure your `.env` file has the correct database URL:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/resumematch
```

**Format:** `postgresql://[username]:[password]@[host]:[port]/[database]`

---

## Troubleshooting

### PostgreSQL Service Won't Start

```bash
# Check logs
sudo journalctl -u postgresql -n 50

# Restart service
sudo systemctl restart postgresql
```

### Connection Refused Error

```bash
# Check if PostgreSQL is listening
sudo netstat -plunt | grep 5432

# Check PostgreSQL configuration
sudo nano /etc/postgresql/*/main/postgresql.conf
# Ensure: listen_addresses = 'localhost'

# Restart after changes
sudo systemctl restart postgresql
```

### Permission Denied

```bash
# Check pg_hba.conf
sudo nano /etc/postgresql/*/main/pg_hba.conf

# Ensure this line exists:
# local   all             postgres                                peer
# host    all             all             127.0.0.1/32            md5

# Reload configuration
sudo systemctl reload postgresql
```

### Database Already Exists Error

```bash
# Drop and recreate (WARNING: This deletes all data!)
sudo -u postgres dropdb resumematch
sudo -u postgres createdb resumematch
```

---

## Database Management Commands

### List All Databases

```bash
sudo -u postgres psql -c "\l"
```

### Connect to Database

```bash
sudo -u postgres psql -d resumematch
```

### View Tables (inside psql)

```sql
\dt
```

### View Table Schema

```sql
\d table_name
```

### Backup Database

```bash
sudo -u postgres pg_dump resumematch > backup.sql
```

### Restore Database

```bash
sudo -u postgres psql resumematch < backup.sql
```

---

## Testing the Setup

After database setup, test the backend:

```bash
cd /home/haseeb-raza/Desktop/resume-screening/backend
source ../venv/bin/activate
python -c "from app.database import engine; print('✅ Database connection successful!')"
```

If successful, start the server:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Check health endpoint:

```bash
curl http://localhost:8000/health
```

Expected response:

```json
{
  "status": "healthy",
  "service": "ResumeMatch AI",
  "environment": "development",
  "database": "connected",
  "message": "All systems operational"
}
```

---

## Database Schema

The application will automatically create these tables on first run:

1. **users** - User accounts and authentication
2. **jobs** - Job postings with requirements
3. **resumes** - Uploaded resumes and parsed data
4. **matches** - Resume-job matching results
5. **chat_messages** - Conversation history for RAG chat

---

## Next Steps

Once database is running:

1. ✅ Start backend server
2. ✅ Visit API docs: http://localhost:8000/api/docs
3. ✅ Create a test user account
4. ✅ Upload a test resume
5. ✅ Create a job posting
6. ✅ Test matching functionality

---

## Need Help?

- Check backend logs for detailed error messages
- Visit PostgreSQL docs: https://www.postgresql.org/docs/
- Check `.env` configuration
- Ensure all dependencies are installed: `pip install -r requirements.txt`
