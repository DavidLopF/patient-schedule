import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AppointmentStatus } from '../entities/appointment.entity';

export class UpdateStatusDto {
  @ApiProperty({
    enum: AppointmentStatus,
    example: AppointmentStatus.ASISTIO,
    description: 'New appointment status. Cannot change back to PROGRAMADA.',
  })
  @IsEnum(AppointmentStatus, {
    message: 'status must be PROGRAMADA, ASISTIO or NO_ASISTIO',
  })
  status: AppointmentStatus;
}
