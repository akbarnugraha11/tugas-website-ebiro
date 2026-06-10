import { MongoClient, Db } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your MongoDB URI to .env.local');
}
if (!process.env.MONGODB_DB) {
  throw new Error('Please add MONGODB_DB to .env.local');
}

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function getMongoClient(): Promise<{ client: MongoClient; db: Db }> {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = new MongoClient(uri);

  await client.connect();
  const db = client.db(dbName);

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}
