import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpException,
  Query,
} from '@nestjs/common';

import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { RequestUser, ResponseMessage } from 'src/decorator/customize';
import { IUser } from 'src/users/interface/user.interface';
import { MESSAGE_SUCCESS } from 'src/constants/constants.message';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  // create new job
  @Post('/create-new-job')
  @ResponseMessage(MESSAGE_SUCCESS.CREATE_NEW_JOB_SUCCESS)
  create(@Body() createJobDto: CreateJobDto, @RequestUser() user: IUser) {
    try {
      return this.jobsService.create(createJobDto, user);
    } catch (err) {
      throw new HttpException(err.message, err.status);
    }
  }

  // get all jobs with pagination and search
  @Get('/get-all-jobs')
  @ResponseMessage(MESSAGE_SUCCESS.GET_JOBS_SUCCESS)
  findAll(
    @Query('current') currentPage: number,
    @Query('pageSize') limit: number,
    @Query() queryString: string,
  ) {
    try {
      return this.jobsService.findAll(currentPage, limit, queryString);
    } catch (err) {
      throw new HttpException(err.message, err.status);
    }
  }

  // get job by id
  @Get('/get-job/:id')
  @ResponseMessage(MESSAGE_SUCCESS.GET_JOB_SUCCESS)
  findOne(@Param('id') id: string) {
    try {
      return this.jobsService.findOne(id);
    } catch (err) {
      throw new HttpException(err.message, err.status);
    }
  }

  //update job
  @Patch('/update-job/:id')
  @ResponseMessage(MESSAGE_SUCCESS.UPDATE_JOB_SUCCESS)
  update(
    @Param('id') id: string,
    @Body() updateJobDto: UpdateJobDto,
    @RequestUser() user: IUser,
  ) {
    try {
      return this.jobsService.update(id, updateJobDto, user);
    } catch (error) {}
  }

  // delete job
  @Delete(':id')
  @ResponseMessage(MESSAGE_SUCCESS.DELETE_JOB_SUCCESS)
  remove(@Param('id') id: string, @RequestUser() user: IUser) {
    try {
      return this.jobsService.remove(id, user);
    } catch (err) {
      throw new HttpException(err.message, err.status);
    }
  }
}
