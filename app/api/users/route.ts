import { NextResponse } from 'next/server';
import { getMongoClient } from '@/lib/mongoClient';

const DEFAULT_USERS = [
  {
    name: 'Pak Sastro Wardoyo',
    nimOrId: 'ADMIN',
    role: 'admin',
    password: 'biropinjam123',
    avatarUrl: 'https://picsum.photos/seed/admin/150/150',
    email: 'sastro.wardoyo@biro.kampus.ac.id',
    phone: '+62 811-2233-4455',
    dept: 'Administrasi BAAK',
    active: 'Aktif',
    status: 'Clear',
    borrowsCount: 0
  },
  {
    name: 'Budi Santoso',
    nimOrId: '22019904',
    role: 'mahasiswa',
    password: 'biropinjam123',
    avatarUrl: 'https://picsum.photos/seed/student1/150/150',
    email: 'budi.santoso@mhs.kampus.ac.id',
    phone: '+62 812-4455-8899',
    dept: 'Informatika',
    active: 'Aktif',
    status: 'Clear',
    borrowsCount: 8
  },
  {
    name: 'Siti Aminah',
    nimOrId: '22019905',
    role: 'mahasiswa',
    password: 'biropinjam123',
    avatarUrl: 'https://picsum.photos/seed/student2/150/150',
    email: 'siti.aminah@mhs.kampus.ac.id',
    phone: '+62 812-7788-9900',
    dept: 'Sistem Informasi',
    active: 'Aktif',
    status: 'Clear',
    borrowsCount: 15
  },
  {
    name: 'Agus Hermawan',
    nimOrId: '22019906',
    role: 'mahasiswa',
    password: 'biropinjam123',
    avatarUrl: 'https://picsum.photos/seed/student3/150/150',
    email: 'agus.hermawan@mhs.kampus.ac.id',
    phone: '+62 813-1122-3344',
    dept: 'Teknik Elektro',
    active: 'Aktif',
    status: 'Clear',
    borrowsCount: 6
  },
  {
    name: 'Rina Widya',
    nimOrId: '22019907',
    role: 'mahasiswa',
    password: 'biropinjam123',
    avatarUrl: 'https://picsum.photos/seed/student4/150/150',
    email: 'rina.widya@mhs.kampus.ac.id',
    phone: '+62 813-5566-7788',
    dept: 'Informatika',
    active: 'Ban',
    status: 'Penalti Aktif',
    borrowsCount: 3
  }
];

export async function GET() {
  try {
    const { db } = await getMongoClient();
    const collection = db.collection('users');

    const count = await collection.countDocuments();
    if (count === 0) {
      await collection.insertMany(DEFAULT_USERS);
    }

    const users = await collection.find({}).toArray();
    return NextResponse.json({ ok: true, users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ ok: false, error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nimOrId, name, password, dept, email, phone, role, active, status, borrowsCount, avatarUrl } = body;

    if (!nimOrId || !name) {
      return NextResponse.json({ ok: false, error: 'NIM/ID and Name are required.' }, { status: 400 });
    }

    const { db } = await getMongoClient();
    const collection = db.collection('users');

    // Case-insensitive duplicate check
    const existing = await collection.findOne({
      nimOrId: { $regex: new RegExp(`^${nimOrId.trim()}$`, 'i') }
    });

    if (existing) {
      return NextResponse.json({ ok: false, error: 'NIM or User ID is already registered.' }, { status: 409 });
    }

    const newUser = {
      nimOrId: nimOrId.trim(),
      name: name.trim(),
      role: role || 'mahasiswa',
      avatarUrl: avatarUrl || `https://picsum.photos/seed/${nimOrId.trim()}/150/150`,
      password: password || 'biropinjam123',
      dept: dept || 'Informatika',
      email: email || `${nimOrId.trim()}@mhs.kampus.ac.id`,
      phone: phone || '+62 812-3456-7890',
      active: active || 'Aktif',
      status: status || 'Clear',
      borrowsCount: borrowsCount || 0
    };

    await collection.insertOne(newUser);
    return NextResponse.json({ ok: true, user: newUser });
  } catch (error) {
    console.error('Error registering user:', error);
    return NextResponse.json({ ok: false, error: (error as Error).message }, { status: 500 });
  }
}
