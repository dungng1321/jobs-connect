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
import { ResumesService } from './resumes.service';
import { CreateResumeDto } from './dto/create-resume.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { RequestUser, ResponseMessage } from 'src/decorator/customize';
import { MESSAGE_SUCCESS } from 'src/constants/constants.message';
import { IUser } from 'src/users/interface/user.interface';

@Controller('resumes')
export class ResumesController {
  constructor(private readonly resumesService: ResumesService) {}

  // create new resume
  @Post('/create-new-resume')
  @ResponseMessage(MESSAGE_SUCCESS.CREATE_NEW_RESUME_SUCCESS)
  create(@Body() createResumeDto: CreateResumeDto, @RequestUser() user: IUser) {
    try {
      return this.resumesService.create(createResumeDto, user);
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  @Get('/get-all-resumes')
  @ResponseMessage(MESSAGE_SUCCESS.GET_RESUMES_SUCCESS)
  async findAll(
    @Query('current') currentPage: number,
    @Query('pageSize') limit: number,
    @Query() queryString: string,
  ) {
    try {
      return await this.resumesService.findAll(currentPage, limit, queryString);
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  @Get('/get-resume/:id')
  @ResponseMessage(MESSAGE_SUCCESS.GET_RESUME_SUCCESS)
  findOne(@Param('id') id: string) {
    try {
      return this.resumesService.findOne(id);
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  @Get('/get-resume-by-user')
  @ResponseMessage(MESSAGE_SUCCESS.GET_RESUME_SUCCESS)
  async findOneByUser(@RequestUser() user: IUser) {
    try {
      return await this.resumesService.findByUserLogin(user);
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  // update resume status
  @Patch('/update-resume-status/:id')
  @ResponseMessage(MESSAGE_SUCCESS.UPDATE_RESUME_SUCCESS)
  update(
    @Param('id') id: string,
    @Body() updateResumeDto: UpdateResumeDto,
    @RequestUser() user: IUser,
  ) {
    try {
      return this.resumesService.update(id, updateResumeDto, user);
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  @Delete('/delete-resume/:id')
  @ResponseMessage(MESSAGE_SUCCESS.DELETE_RESUME_SUCCESS)
  remove(@Param('id') id: string, @RequestUser() user: IUser) {
    try {
      return this.resumesService.remove(id, user);
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }
}
