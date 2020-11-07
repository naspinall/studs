import { Client } from "pg";

export const client = new Client({
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_POST),
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
});

const connectToDatabase = async () => await client.connect();
const disconnectFromDatabase = async () => await client.end();

const escapeIdentifier = (input: string) => client.escapeIdentifier(input);

export { escapeIdentifier, connectToDatabase, disconnectFromDatabase };
