import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import { Booking } from '@/models/Booking';
import { Car } from '@/models/Car';
import { ObjectId } from 'mongodb';

export async function POST(request: Request) {
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

    const { carId, startDate, endDate, passengers } = await request.json();

    if (!carId || !startDate || !endDate || !passengers) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    // 1. Fetch car details to get price per day
    const car = await db.collection<Car>('cars').findOne({ _id: new ObjectId(carId) });
    if (!car) {
      return NextResponse.json({ message: 'Car not found' }, { status: 404 });
    }

    // 2. Calculate Total Price
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1; // Minimum 1 day
    const totalPrice = diffDays * car.pricePerDay;

    // 3. Create Booking
    const newBooking: Booking = {
      userId: payload.id as string,
      carId,
      startDate,
      endDate,
      totalPrice,
      passengers: Number(passengers),
      status: 'pending',
      createdAt: new Date(),
    };

    await db.collection('bookings').insertOne(newBooking);

    return NextResponse.json(
      { message: 'Booking successful', booking: newBooking },
      { status: 201 }
    );
  } catch (error) {
    console.error('Booking Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
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
    
    // Join with cars to show car details in the admin table
    const bookings = await db.collection('bookings').aggregate([
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
    console.error('Fetch Bookings Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
