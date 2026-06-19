# Notification App Frontend

This is the frontend for the campus notification app. It shows all notifications and also has a priority inbox page.

## How To Run

First install packages:

```bash
npm install
```

Create a file:

```text
src/.env
```

Add these values in it:

```env
VITE_EMAIL=your_email
VITE_NAME=your_name
VITE_ROLL_NO=your_roll_no
VITE_ACCESS_CODE=your_access_code
VITE_CLIENT_ID=your_client_id
VITE_CLIENT_SECRET=your_client_secret
VITE_TOKEN=your_access_token
```

Then run the app:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Notes

- The `.env` file is not pushed because it has token and secret values.
- If the token expires, the app can get a new token using the details in `.env`.
- The app uses Material UI for styling.
