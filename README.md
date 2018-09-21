# Time Tiles

## Set Up

### Install Dependencies

```
npm install

```

### Setting Up Local Database for Dev

Have the following environment variables set for the app to run:

```bash

DB_HOST=yourdbhost
DB_USER=username
DB_PASSWORD=db_password
DB_NAME=db_database_name
JWT_TOKEN=somesecret
SESSION_SECRET=othersecret

```


`DB` is for app-related database operations. `SECURE_DB` is for auth-related database operations.


### Configuring the Remote Database

Run the following command with the proper environment variables set

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
