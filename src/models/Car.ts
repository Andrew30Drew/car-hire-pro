import { ObjectId } from 'mongodb';

export interface Car {
  _id?: ObjectId;
  brand: string;
  model: string;
  pricePerDay: number;
  category: string;
  imageUrl: string;
  createdAt?: Date;
}
