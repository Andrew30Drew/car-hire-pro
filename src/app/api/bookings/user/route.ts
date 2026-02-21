import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const payload = await verifyToken(token);

    if (!payload) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();

    // Fetch user-specific bookings and join with car details
    const bookings = await db.collection('bookings').aggregate([
      {
        $match: { userId: payload.id }
      },
      {
        $addFields: {
          carObjectId: { $toObjectId: "$carId" }
        }
      },
      {
        $lookup: {
          from: 'cars',
          localField: 'carObjectId',
          foreignField: '_id',
          as: 'carDetails'
        }
      },
      { $unwind: '$carDetails' },
      { $sort: { createdAt: -1 } },
      {
        $project: {
          _id: { $toString: "$_id" },
          userId: 1,
          carId: 1,
          startDate: 1,
          endDate: 1,
          totalPrice: 1,
          passengers: 1,
          status: 1,
          createdAt: 1,
          carDetails: 1
        }
      }
    ]).toArray();

    return NextResponse.json(bookings);
  } catch (error) {
    console.error('User Fetch Bookings Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
