import { IsUUID, IsDateString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAppointmentDto {
  @ApiProperty({ example: 'uuid-of-doctor', description: 'Doctor UUID' })
  @IsUUID('4', { message: 'doctorId must be a valid UUID' })
  doctorId: string;

  @ApiProperty({ example: 'uuid-of-patient', description: 'Patient UUID' })
  @IsUUID('4', { message: 'patientId must be a valid UUID' })
  patientId: string;

  @ApiProperty({
    example: '2026-04-20T10:00:00Z',
    description: 'Desired appointment date (ISO 8601)',
  })
  @IsNotEmpty()
  @IsDateString({}, { message: 'appointmentDate must be a valid ISO 8601 date' })
  appointmentDate: string;
}
