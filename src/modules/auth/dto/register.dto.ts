import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '../../../common/enums/role.enum';

export class RegisterDto {
  @ApiProperty({ example: 'doctor@hospital.com' })
  @IsEmail({}, { message: 'Must be a valid email address' })
  email: string;

  @ApiProperty({ example: 'SecurePass123!', minLength: 8 })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  password: string;

  @ApiPropertyOptional({ enum: Role, default: Role.RECEPTIONIST })
  @IsEnum(Role, { message: 'Role must be ADMIN, DOCTOR or RECEPTIONIST' })
  role: Role = Role.RECEPTIONIST;
}
