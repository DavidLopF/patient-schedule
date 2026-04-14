import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  IsDateString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDoctorDto {
  @ApiProperty({ example: '9876543210', description: 'National ID number (numbers only, max 20)' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  @Matches(/^\d+$/, { message: 'identification must contain only numbers' })
  identification: string;

  @ApiProperty({ example: 'María', maxLength: 90 })
  @IsNotEmpty()
  @IsString()
  @MaxLength(90)
  firstName: string;

  @ApiProperty({ example: 'González', maxLength: 90 })
  @IsNotEmpty()
  @IsString()
  @MaxLength(90)
  lastName: string;

  @ApiProperty({ example: 'maria.gonzalez@hospital.com', maxLength: 200 })
  @IsEmail({}, { message: 'email must be a valid email address' })
  @MaxLength(200)
  email: string;

  @ApiProperty({ example: '3109876543', maxLength: 20 })
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  phone: string;

  @ApiProperty({ example: 'Carrera 50 #20-10', maxLength: 200 })
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  address: string;

  @ApiProperty({ example: 'Medellín', maxLength: 90 })
  @IsNotEmpty()
  @IsString()
  @MaxLength(90)
  city: string;

  @ApiProperty({ example: 'TP-12345', description: 'Professional medical card number' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  professionalCard: string;

  @ApiProperty({ example: '2020-03-15', description: 'Date joined the medical center (YYYY-MM-DD)' })
  @IsDateString({}, { message: 'admissionDate must be a valid date (YYYY-MM-DD)' })
  admissionDate: string;
}
