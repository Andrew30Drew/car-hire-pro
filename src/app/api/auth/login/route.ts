import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { User } from '@/models/User';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Missing email or password' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    const user = await db.collection<User>('users').findOne({ email });

    if (!user) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const token = await signToken({
      id: user._id?.toString(),
      email: user.email,
      role: user.role,
    });

    return NextResponse.json({ token }, { status: 200 });
  } catch (error) {
    console.error('Login Error:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
