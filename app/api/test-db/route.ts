import { NextResponse } from 'next/server';
import { getMongoClient } from '@/lib/mongoClient';

export async function GET() {
  try {
    const { client, db } = await getMongoClient();
    // Perform a simple operation to verify connection
    const collections = await db.listCollections().toArray();
    // Close client if you want to free resources (optional in serverless)
    // await client.close();
    return NextResponse.json({ ok: true, collections: collections.map(c => c.name) });
  } catch (error) {
    console.error('MongoDB connection error:', error);
    return NextResponse.json({ ok: false, error: (error as Error).message }, { status: 500 });
  }
}
