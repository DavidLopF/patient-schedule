import { PartialType } from '@nestjs/swagger';
import { CreatePatientDto } from './create-patient.dto';
import { OmitType } from '@nestjs/swagger';

export class UpdatePatientDto extends PartialType(
  OmitType(CreatePatientDto, ['identification'] as const),
) {}
