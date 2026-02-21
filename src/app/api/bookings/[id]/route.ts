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
    const cleanId = id?.trim();

    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const payload = await verifyToken(token);
    if (!payload) return NextResponse.json({ message: 'Invalid token' }, { status: 401 });

    const body = await request.json();
    const client = await clientPromise;
    const db = client.db();

    // Support both ObjectId and String ID lookups
    const filter: any = { $or: [] };
    if (ObjectId.isValid(cleanId)) filter.$or.push({ _id: new ObjectId(cleanId) });
    filter.$or.push({ _id: cleanId });

    // 1. Fetch the booking to verify ownership
    const booking = await db.collection('bookings').findOne(filter);
    if (!booking) return NextResponse.json({ message: 'Booking not found' }, { status: 404 });

    const isAdmin = payload.role === 'admin';
    const isOwner = booking.userId === payload.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    // 2. Prepare Updates
    let updates: any = { updatedAt: new Date() };

    if (isAdmin) {
      if (body.status) updates.status = body.status;
      // Admin can also update everything else if needed
      updates = { ...updates, ...body };
    } else {
      // User can only cancel or change dates/passengers
      if (body.status === 'cancelled') {
        updates.status = 'cancelled';
      } else {
        // Recalculate price if dates change
        const startDate = body.startDate || booking.startDate;
        const endDate = body.endDate || booking.endDate;
        const passengers = body.passengers || booking.passengers;

        if (body.startDate || body.endDate) {
          const car = await db.collection('cars').findOne({ _id: new ObjectId(booking.carId) });
          if (car) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            const diffTime = Math.abs(end.getTime() - start.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
            updates.totalPrice = diffDays * car.pricePerDay;
          }
        }
        
        updates.startDate = startDate;
        updates.endDate = endDate;
        updates.passengers = Number(passengers);
      }
    }

    const result = await db.collection('bookings').updateOne(filter, { $set: updates });

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: 'Update failed' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Booking updated successfully', updates });
  } catch (error: any) {
    console.error('PATCH BOOKING ERROR:', error);
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
