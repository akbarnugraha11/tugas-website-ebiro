import { NextResponse } from 'next/server';
import { getMongoClient } from '@/lib/mongoClient';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nimOrId } = body;

    if (!nimOrId) {
      return NextResponse.json({ ok: false, error: 'nimOrId is required.' }, { status: 400 });
    }

    if (nimOrId.trim().toUpperCase() === 'ADMIN') {
      return NextResponse.json({ ok: false, error: 'Cannot delete the Super Admin account.' }, { status: 403 });
    }

    const { db } = await getMongoClient();
    const collection = db.collection('users');

    // Case-insensitive deletion
    const result = await collection.deleteOne({
      nimOrId: { $regex: new RegExp(`^${nimOrId.trim()}$`, 'i') }
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ ok: false, error: 'User not found in database.' }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ ok: false, error: (error as Error).message }, { status: 500 });
  }
}
