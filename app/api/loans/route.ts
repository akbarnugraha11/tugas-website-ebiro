import { NextResponse } from 'next/server';
import { getMongoClient } from '@/lib/mongoClient';

const INITIAL_LOANS = [
  {
    id: 'L-101', nim: '22019904', studentName: 'Budi Santoso', itemId: '1',
    itemName: 'InFocus Epson EB-X41', itemCode: 'INF-001',
    eventName: 'Seminar Nasional Himpunan Teknik', location: 'Aula Gedung C Lantai 3',
    notes: 'Mohon dicek remote dan kabel HDMI pengganti.', date: '2026-05-24',
    timeSlot: '09:00 - 11:00', status: 'Disetujui', createdAt: '2026-05-22T08:30:00Z', timelineStep: 2,
  },
  {
    id: 'L-102', nim: '22019904', studentName: 'Budi Santoso', itemId: '3',
    itemName: 'InFocus Panasonic PT-LB303', itemCode: 'INF-003',
    eventName: 'Praktikum Jaringan Komputer II', location: 'Lab Komputer Baru',
    notes: 'Pinjam kabel VGA sekalian.', date: '2026-05-23',
    timeSlot: '13:00 - 15:00', status: 'Dipinjam', createdAt: '2026-05-23T07:15:00Z', timelineStep: 3,
  },
  {
    id: 'L-103', nim: '22019905', studentName: 'Siti Aminah', itemId: '4',
    itemName: 'InFocus BenQ MX550', itemCode: 'INF-004',
    eventName: 'Rapat Koordinasi BEM SF', location: 'Ruang Rapat Ormas',
    notes: 'Kondisi barang agak berdebu.', date: '2026-05-22',
    timeSlot: '10:00 - 12:00', status: 'Selesai', createdAt: '2026-05-22T09:00:00Z', timelineStep: 4,
  },
  {
    id: 'L-104', nim: '22019906', studentName: 'Agus Hermawan', itemId: '2',
    itemName: 'InFocus Sony VPL-DX221', itemCode: 'INF-002',
    eventName: 'Ujian Skripsi Tugas Akhir', location: 'Ruang Sidang Jurusan',
    notes: 'Digunakan oleh dosen penguji utama.', date: '2026-05-25',
    timeSlot: '08:00 - 10:00', status: 'Menunggu', createdAt: '2026-05-23T11:45:00Z', timelineStep: 1,
  },
  {
    id: 'L-105', nim: '22019907', studentName: 'Rina Widya', itemId: '6',
    itemName: 'InFocus Epson EB-W51', itemCode: 'INF-006',
    eventName: 'Colloquium Informatika', location: 'Ruang Seminar 2',
    notes: 'Dibutuhkan resolusi widescreen.', date: '2026-05-20',
    timeSlot: '15:00 - 17:00', status: 'Ditolak', createdAt: '2026-05-19T14:00:00Z', timelineStep: 4,
  },
];

export async function GET() {
  try {
    const { db } = await getMongoClient();
    const collection = db.collection('loans');

    const count = await collection.countDocuments();
    if (count === 0) {
      await collection.insertMany(INITIAL_LOANS);
    }

    const loans = await collection.find({}).toArray();
    return NextResponse.json({ ok: true, loans });
  } catch (error) {
    console.error('Error fetching loans:', error);
    return NextResponse.json({ ok: false, error: (error as Error).message }, { status: 500 });
  }
}

// POST: Replace all loans data (full sync from client state)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { loans } = body;

    if (!loans || !Array.isArray(loans)) {
      return NextResponse.json({ ok: false, error: 'loans array is required.' }, { status: 400 });
    }

    const { db } = await getMongoClient();
    const collection = db.collection('loans');

    await collection.deleteMany({});
    if (loans.length > 0) {
      const cleanLoans = loans.map(({ _id, ...rest }: any) => rest);
      await collection.insertMany(cleanLoans);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error syncing loans:', error);
    return NextResponse.json({ ok: false, error: (error as Error).message }, { status: 500 });
  }
}
