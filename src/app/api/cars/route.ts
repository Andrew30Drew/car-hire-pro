import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const cars = await db.collection('cars').find({}).toArray();

    return NextResponse.json(cars, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: 'Error fetching cars' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const payload = await verifyToken(token);

    if (!payload || payload.role !== 'admin') {
      return NextResponse.json(
        { message: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }
  
    const formData = await request.formData();
    const model = formData.get('model') as string;
    const brand = formData.get('brand') as string;
    const pricePerDay = formData.get('pricePerDay') as string;
    const category = formData.get('category') as string;
    const image = formData.get('image') as File | null;
  
    if (!model || !brand || !pricePerDay || !category || !image) {
      return NextResponse.json(
        { message: 'Missing required fields or image' },
        { status: 400 }
      );
    }

    // Save Image
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const extension = image.name.split('.').pop();
    const filename = `${uuidv4()}.${extension}`;
    const uploadPath = join(process.cwd(), 'public', 'uploads', filename);
    await writeFile(uploadPath, buffer);
    const imageUrl = `/uploads/${filename}`;

    const client = await clientPromise;
    const db = client.db();

    const newCar = {
      model,
      brand,
      pricePerDay: parseFloat(pricePerDay),
      category,
      imageUrl,
      createdAt: new Date(),
    };

    const result = await db.collection('cars').insertOne(newCar);

    return NextResponse.json(
      { message: 'Car added successfully', carId: result.insertedId },
      { status: 201 }
    );
  } catch (error) {
    console.error('Car Creation Error:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
