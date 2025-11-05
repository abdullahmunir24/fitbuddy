# Default User Information

## Login Credentials

A default member account is available for immediate login:

- **Email**: `raad.sask@gmail.com`
- **Password**: `Raad7223!`
- **Role**: `member`

## Using the Default Account

1. Navigate to http://localhost:3000
2. Click "Login"
3. Enter the credentials above
4. You'll be taken to the member dashboard

## Verifying the Account

Check if the account exists in the database:

```bash
docker exec fitbuddy-postgres psql -U fitbuddy_user -d fitbuddy_db -c "SELECT id, email, full_name, role FROM users WHERE email = 'raad.sask@gmail.com';"
```

## Re-seeding the User

If you need to recreate the default user:

### From Inside Docker Container:
```bash
docker exec -e DB_HOST=postgres fitbuddy-backend node src/seed-default-user.js
```

### From Host Machine:
```bash
cd backend
npm run seed-user
```

Note: Make sure you have a `.env` file with proper database credentials in the backend directory.

## Account Details

- **User ID**: 1
- **Username**: raad
- **Full Name**: Raad Sarker
- **Email Verified**: Yes
- **Account Status**: Active

## Security Note

This is a development/testing account. In production:
- Change the password to something more secure
- Enable email verification
- Consider removing or disabling test accounts
- Use strong, unique passwords for all accounts

## Troubleshooting

### Can't Login?
1. Verify the database is running: `docker ps`
2. Check if the user exists (see command above)
3. Ensure backend is running on port 3001
4. Check browser console for errors

### Need to Reset Password?
Run the seed script again - it will show the current password without recreating the user.

### User Not Found?
Run the seed script to create it:
```bash
docker exec -e DB_HOST=postgres fitbuddy-backend node src/seed-default-user.js
```

