import { NextResponse } from 'next/server';
import { getMongoClient } from '@/lib/mongoClient';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nimOrId, update } = body;

    if (!nimOrId || !update) {
      return NextResponse.json({ ok: false, error: 'nimOrId and update payload are required.' }, { status: 400 });
    }

    const { db } = await getMongoClient();
    const collection = db.collection('users');

    // Case-insensitive update targeting nimOrId
    const result = await collection.updateOne(
      { nimOrId: { $regex: new RegExp(`^${nimOrId.trim()}$`, 'i') } },
      { $set: update }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ ok: false, error: 'User not found.' }, { status: 404 });
    }

    return NextResponse.json({ ok: true, matchedCount: result.matchedCount, modifiedCount: result.modifiedCount });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ ok: false, error: (error as Error).message }, { status: 500 });
  }
}
