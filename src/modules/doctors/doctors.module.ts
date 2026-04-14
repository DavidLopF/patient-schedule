import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Doctor } from './entities/doctor.entity';
import { DoctorService } from './services/doctor.service';
import { DoctorController } from './controllers/doctor.controller';
import { DoctorRepository } from './repositories/doctor.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Doctor])],
  providers: [DoctorService, DoctorRepository],
  controllers: [DoctorController],
  exports: [DoctorService, DoctorRepository],
})
export class DoctorsModule {}
