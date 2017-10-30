# Time Tiles

## Set Up

### Setting Up Local Database for Dev

In `app/config/config.json` have the following content:

```json

{
  "mysql": {
      "host": "db host",
      "user": "db user",
      "password": "db password",
      "database": "db database name"
  },
  "secure_mysql": {
    "host": "db host",
    "user": "db user",
    "password": "db password",
    "database": "db database name"
  },
  "session_secret": "secret for session storage"
}

```

`mysql` is for app-related database operations. `secure_mysql` is for auth-related database operations.

### Configuring the Remote Database

Run the following command and give information as requested

```
npm run setup

```

## Running the Server

```
npm start

```
