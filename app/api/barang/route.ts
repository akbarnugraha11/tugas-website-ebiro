import { NextResponse } from 'next/server';
import { getMongoClient } from '@/lib/mongoClient';

const INITIAL_BARANG = [
  { id: '1', name: 'InFocus Epson EB-X41', code: 'INF-001', status: 'Tersedia', kondisi: 'Baik', totalBorrow: 24, active: true, quantity: 1, imageIcon: 'Monitor' },
  { id: '2', name: 'InFocus Sony VPL-DX221', code: 'INF-002', status: 'Tersedia', kondisi: 'Baik', totalBorrow: 18, active: true, quantity: 1, imageIcon: 'Tv' },
  { id: '3', name: 'InFocus Panasonic PT-LB303', code: 'INF-003', status: 'Dipinjam', kondisi: 'Baik', totalBorrow: 31, active: true, quantity: 1, imageIcon: 'Laptop' },
  { id: '4', name: 'InFocus BenQ MX550', code: 'INF-004', status: 'Maintenance', kondisi: 'Rusak Ringan', totalBorrow: 12, active: true, quantity: 1, imageIcon: 'Wrench' },
  { id: '5', name: 'InFocus ViewSonic PA503W', code: 'INF-005', status: 'Tersedia', kondisi: 'Rusak Ringan', totalBorrow: 8, active: true, quantity: 1, imageIcon: 'Monitor' },
  { id: '6', name: 'InFocus Epson EB-W51', code: 'INF-006', status: 'Tersedia', kondisi: 'Baik', totalBorrow: 15, active: true, quantity: 1, imageIcon: 'Tv' },
];

export async function GET() {
  try {
    const { db } = await getMongoClient();
    const collection = db.collection('barang');

    const count = await collection.countDocuments();
    if (count === 0) {
      await collection.insertMany(INITIAL_BARANG);
    }

    const barang = await collection.find({}).toArray();
    return NextResponse.json({ ok: true, barang });
  } catch (error) {
    console.error('Error fetching barang:', error);
    return NextResponse.json({ ok: false, error: (error as Error).message }, { status: 500 });
  }
}

// POST: Replace all barang data (full sync from client state)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { barang } = body;

    if (!barang || !Array.isArray(barang)) {
      return NextResponse.json({ ok: false, error: 'barang array is required.' }, { status: 400 });
    }

    const { db } = await getMongoClient();
    const collection = db.collection('barang');

    // Replace entire collection with current state
    await collection.deleteMany({});
    if (barang.length > 0) {
      // Remove _id fields to avoid duplicate key errors
      const cleanBarang = barang.map(({ _id, ...rest }: any) => rest);
      await collection.insertMany(cleanBarang);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error syncing barang:', error);
    return NextResponse.json({ ok: false, error: (error as Error).message }, { status: 500 });
  }
}
