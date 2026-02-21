import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { hashPassword } from '@/lib/auth';
import { User } from '@/models/User';

export async function POST(request: Request) {
  try {
    const { email, password, role } = await request.json();

    if (!email || !password || !role) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (role !== 'user' && role !== 'admin') {
      return NextResponse.json(
        { message: 'Invalid role. Must be "user" or "admin".' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // Check if user already exists
    const existingUser = await db.collection<User>('users').findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: 'User already exists' },
        { status: 422 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const newUser: User = {
      email,
      password: hashedPassword,
      role,
    };

    await db.collection('users').insertOne(newUser);

    return NextResponse.json(
      { message: 'User created', user: { email, role } },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration Error:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
