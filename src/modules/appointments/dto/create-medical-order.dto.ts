import { IsDateString, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMedicalOrderDto {
  @ApiProperty({ example: 'Complete blood count and metabolic panel' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({
    example: '2026-12-31',
    description: 'Order expiration date (YYYY-MM-DD)',
  })
  @IsDateString(
    {},
    { message: 'expirationDate must be a valid date (YYYY-MM-DD)' },
  )
  expirationDate: string;

  @ApiProperty({ example: 'Internal Medicine', maxLength: 100 })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  specialty: string;
}
