import { IsDateString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AvailableDoctorsQueryDto {
  @ApiProperty({
    example: '2026-04-20T10:00:00Z',
    description: 'Target appointment date to check doctor availability',
  })
  @IsNotEmpty()
  @IsDateString({}, { message: 'date must be a valid ISO 8601 date' })
  date: string;
}
