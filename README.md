# Time Tiles

## Set Up

### Install Dependencies

```
npm install

```

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
  "jwt_secret": "secret for JWT tokens",
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

To simply get the server running,

```
npm start

```

To get the server running with linting and tests,

```

npm run full-start

```
