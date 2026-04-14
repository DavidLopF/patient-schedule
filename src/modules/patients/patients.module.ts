import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Patient } from './entities/patient.entity';
import { PatientService } from './services/patient.service';
import { PatientController } from './controllers/patient.controller';
import { PatientRepository } from './repositories/patient.repository';
import { IdempotencyService } from '../../common/services/idempotency.service';
import { IdempotencyInterceptor } from '../../common/interceptors/idempotency.interceptor';

@Module({
  imports: [TypeOrmModule.forFeature([Patient])],
  providers: [PatientService, PatientRepository, IdempotencyService, IdempotencyInterceptor],
  controllers: [PatientController],
  exports: [PatientService, PatientRepository],
})
export class PatientsModule {}
