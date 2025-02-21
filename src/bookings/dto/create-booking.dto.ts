import { Transform } from 'class-transformer';
import { IsDate, IsOptional, IsString, MinDate } from 'class-validator';

export class BookingSearchDto {
  @IsDate()
  @Transform(({ value }) => new Date(value))
  @MinDate(new Date())
  checkIn: string;

  @IsDate()
  @Transform(({ value }) => new Date(value))
  @MinDate(new Date())
  checkOut: string;

  @IsString()
  @IsOptional()
  roomType?: string;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  maxPrice?: number;
}

export class CreateBookingDto {
  @IsString()
  roomId: string;

  @IsDate()
  @Transform(({ value }) => new Date(value))
  @MinDate(new Date())
  checkIn: string;

  @IsDate()
  @Transform(({ value }) => new Date(value))
  @MinDate(new Date())
  checkOut: string;

  @IsString()
  @IsOptional()
  specialRequests?: string;
}
