import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

export enum RoomType {
  SINGLE = 'SINGLE',
  DOUBLE = 'DOUBLE',
  SUITE = 'SUITE',
  DELUXE = 'DELUXE',
}

export class CreateRoomDto {
  @IsString()
  number: string;

  @IsEnum(RoomType)
  type: RoomType;

  @IsNumber()
  price: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  capacity: number;
}
