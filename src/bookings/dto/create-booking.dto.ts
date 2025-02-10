import { IsDateString, IsOptional, IsString, MinDate } from 'class-validator';
import { Transform } from 'class-transformer';

export class BookingSearchDto {
  @IsDateString()
  @Transform(({ value }) => new Date(value))
  @MinDate(new Date())
  checkIn: string;

  @IsDateString()
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

  @IsDateString()
  @Transform(({ value }) => new Date(value))
  @MinDate(new Date())
  checkIn: string;

  @IsDateString()
  @Transform(({ value }) => new Date(value))
  @MinDate(new Date())
  checkOut: string;

  @IsString()
  @IsOptional()
  specialRequests?: string;
}
