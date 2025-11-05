# FitBuddy Database

## PostgreSQL Setup

This folder contains the database schema and migrations for FitBuddy.

### Prerequisites

- PostgreSQL installed locally, OR
- Use the provided Docker Compose setup (recommended)

### Using Docker Compose (Recommended)

From the project root, run:

```bash
docker-compose up -d
```

This will spin up a PostgreSQL container with the following credentials:
- **Host**: localhost
- **Port**: 5432
- **Database**: fitbuddy_db
- **Username**: fitbuddy_user
- **Password**: fitbuddy_password

### Running the Schema

Once PostgreSQL is running, execute the schema:

```bash
psql -h localhost -U fitbuddy_user -d fitbuddy_db -f schema.sql
```

Or connect via your preferred PostgreSQL client and run the `schema.sql` file.

### Seed Default User

After running the schema, seed the default member user:

```bash
cd ../backend
npm run seed-user
```

This creates a default user with the following credentials:
- **Email**: raad.sask@gmail.com
- **Password**: Raad7223!
- **Role**: member

The script is safe to run multiple times - it will skip creation if the user already exists.

### Migrations

Place database migration files in the `migrations/` folder as your schema evolves.

