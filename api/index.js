import dotenv from 'dotenv';
dotenv.config();

import { app, server } from './app.js';

const PORT = process.env.PORT || 8080;

server.listen(PORT, () => {

});

app.get('/', (req, res) => {
  res.send('Hello World !');
});

const host = process.env.POSTGRES_HOST;
const user = process.env.POSTGRES_USER;
const pass = process.env.POSTGRES_PASSWORD;
const db = process.env.POSTGRES_DB;
const db_port = process.env.DB_PORT || 5432;


// Concatenate the two parts
const fullDatabaseUrl = `postgresql://${user}:${pass}@${host}:${db_port}/${db}?schema=public`;

// Set the full URL as the DATABASE_URL in the environment
process.env.DATABASE_URL = fullDatabaseUrl;
