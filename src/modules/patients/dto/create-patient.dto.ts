import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePatientDto {
  @ApiProperty({
    example: '1234567890',
    description: 'National ID number (numbers only, max 20)',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  @Matches(/^\d+$/, { message: 'identification must contain only numbers' })
  identification: string;

  @ApiProperty({ example: 'John', maxLength: 90 })
  @IsNotEmpty()
  @IsString()
  @MaxLength(90)
  firstName: string;

  @ApiProperty({ example: 'Doe', maxLength: 90 })
  @IsNotEmpty()
  @IsString()
  @MaxLength(90)
  lastName: string;

  @ApiProperty({ example: 'john.doe@email.com', maxLength: 200 })
  @IsEmail({}, { message: 'email must be a valid email address' })
  @MaxLength(200)
  email: string;

  @ApiProperty({ example: '3001234567', maxLength: 20 })
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  phone: string;

  @ApiProperty({ example: 'Calle 123 #45-67', maxLength: 200 })
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  address: string;

  @ApiProperty({ example: 'Bogotá', maxLength: 90 })
  @IsNotEmpty()
  @IsString()
  @MaxLength(90)
  city: string;
}
