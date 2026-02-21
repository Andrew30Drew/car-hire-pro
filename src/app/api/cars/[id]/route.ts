import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function PATCH(
  request: Request,
  { params }: { params: any }
) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id } = resolvedParams;

    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const payload = await verifyToken(token);

    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const updates = await request.json();
    const client = await clientPromise;
    const db = client.db();

    const result = await db.collection('cars').updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...updates, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: 'Car not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Car updated successfully' });
  } catch (error) {
    console.error('Update Car Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: any }
) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id } = resolvedParams;

    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const payload = await verifyToken(token);

    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const client = await clientPromise;
    const db = client.db();

    const result = await db.collection('cars').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: 'Car not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Car deleted successfully' });
  } catch (error) {
    console.error('Delete Car Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
