import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { User } from '@/models/User';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const payload = await verifyToken(token);

    if (!payload || !payload.id) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();

    // Fetch user details from database
    const user = await db.collection<User>('users').findOne(
      { _id: new ObjectId(payload.id as string) },
      { projection: { password: 0 } } // Don't return the hashed password
    );

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      email: user.email,
      role: user.role,
      id: user._id?.toString()
    });
  } catch (error) {
    console.error('Fetch User Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
