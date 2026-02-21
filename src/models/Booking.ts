import { ObjectId } from 'mongodb';

export interface Booking {
  _id?: ObjectId;
  userId: string;
  carId: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  passengers: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt?: Date;
}
