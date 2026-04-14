import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { AppointmentService } from '../services/appointment.service';
import { CreateAppointmentDto } from '../dto/create-appointment.dto';
import { UpdateStatusDto } from '../dto/update-status.dto';
import { CreateMedicalOrderDto } from '../dto/create-medical-order.dto';
import { AvailableDoctorsQueryDto } from '../dto/available-doctors-query.dto';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Role } from '../../../common/enums/role.enum';
import type { JwtPayload } from '../../auth/interfaces/jwt-payload.interface';

@ApiTags('Appointments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('appointments')
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(Role.ADMIN, Role.RECEPTIONIST)
  @ApiOperation({ summary: 'Schedule a new appointment' })
  @ApiResponse({
    status: 201,
    description: 'Appointment created in PROGRAMADA status',
  })
  @ApiResponse({
    status: 409,
    description: 'Doctor not available at this time',
  })
  create(@Body() dto: CreateAppointmentDto) {
    return this.appointmentService.create(dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.RECEPTIONIST, Role.DOCTOR)
  @ApiOperation({ summary: 'List all appointments (paginated)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  findAll(@Query() pagination: PaginationDto) {
    return this.appointmentService.findAll(pagination);
  }

  @Get('available-doctors')
  @Roles(Role.ADMIN, Role.RECEPTIONIST, Role.DOCTOR)
  @ApiOperation({ summary: 'Get available doctors for a given date/time' })
  @ApiQuery({ name: 'date', type: String, example: '2026-04-20T10:00:00Z' })
  getAvailableDoctors(@Query() query: AvailableDoctorsQueryDto) {
    return this.appointmentService.getAvailableDoctors(query);
  }

  @Get('by-date')
  @Roles(Role.ADMIN, Role.RECEPTIONIST, Role.DOCTOR)
  @ApiOperation({ summary: 'Find appointments by date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'date', type: String, example: '2026-04-20' })
  findByDate(@Query('date') date: string) {
    return this.appointmentService.findByDate(date);
  }

  @Get('patient/:identification')
  @Roles(Role.ADMIN, Role.RECEPTIONIST, Role.DOCTOR)
  @ApiOperation({
    summary: 'Find appointments by patient identification number',
  })
  @ApiParam({ name: 'identification', description: 'Patient ID number' })
  findByPatient(@Param('identification') identification: string) {
    return this.appointmentService.findByPatientIdentification(identification);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.RECEPTIONIST, Role.DOCTOR)
  @ApiOperation({ summary: 'Get appointment by UUID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.appointmentService.findOne(id);
  }

  @Patch(':id/status')
  @Roles(Role.ADMIN, Role.DOCTOR)
  @ApiOperation({ summary: 'Update appointment status (DOCTOR/ADMIN only)' })
  @ApiResponse({ status: 200, description: 'Status updated successfully' })
  @ApiResponse({
    status: 403,
    description: 'Doctor can only update their own appointments',
  })
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStatusDto,
    @CurrentUser() currentUser: JwtPayload,
  ) {
    return this.appointmentService.updateStatus(id, dto, currentUser);
  }

  @Post(':id/medical-orders')
  @HttpCode(HttpStatus.CREATED)
  @Roles(Role.ADMIN, Role.DOCTOR)
  @ApiOperation({
    summary: 'Attach a medical order to an appointment (DOCTOR/ADMIN only)',
  })
  @ApiResponse({ status: 201, description: 'Medical order added' })
  addMedicalOrder(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateMedicalOrderDto,
    @CurrentUser() currentUser: JwtPayload,
  ) {
    return this.appointmentService.addMedicalOrder(id, dto, currentUser);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Cancel/delete an appointment (ADMIN only)' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.appointmentService.remove(id);
  }
}
