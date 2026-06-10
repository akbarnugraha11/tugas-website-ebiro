import { NextResponse } from 'next/server';
import { getMongoClient } from '@/lib/mongoClient';

const INITIAL_LOGS = [
  { id: '1', type: 'submit', text: 'Agus Hermawan mengajukan peminjaman INF-002 untuk Sidang Jurusan', timestamp: '10 menit lalu' },
  { id: '2', type: 'approve', text: 'Peminjaman INF-001 disetujui untuk Kak Budi oleh Admin', timestamp: '30 menit lalu' },
  { id: '3', type: 'reject', text: 'Peminjaman Rina Widya ditolak karena jadwal bentrok', timestamp: '1 jam lalu' },
  { id: '4', type: 'penalty', text: 'Penalti peminjaman diberikan ke Budi Santoso karena keterlambatan', timestamp: '3 jam lalu' },
];

export async function GET() {
  try {
    const { db } = await getMongoClient();
    const collection = db.collection('logs');

    const count = await collection.countDocuments();
    if (count === 0) {
      await collection.insertMany(INITIAL_LOGS);
    }

    const logs = await collection.find({}).toArray();
    return NextResponse.json({ ok: true, logs });
  } catch (error) {
    console.error('Error fetching logs:', error);
    return NextResponse.json({ ok: false, error: (error as Error).message }, { status: 500 });
  }
}

// POST: Replace all logs data (full sync from client state)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { logs } = body;

    if (!logs || !Array.isArray(logs)) {
      return NextResponse.json({ ok: false, error: 'logs array is required.' }, { status: 400 });
    }

    const { db } = await getMongoClient();
    const collection = db.collection('logs');

    await collection.deleteMany({});
    if (logs.length > 0) {
      const cleanLogs = logs.map(({ _id, ...rest }: any) => rest);
      await collection.insertMany(cleanLogs);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error syncing logs:', error);
    return NextResponse.json({ ok: false, error: (error as Error).message }, { status: 500 });
  }
}
