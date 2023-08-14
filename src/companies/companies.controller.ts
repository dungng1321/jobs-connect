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
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { User } from 'src/decorator/customize';
import { IUser } from 'src/users/interface/user.interface';

@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post('create-new-company')
  create(@Body() createCompanyDto: CreateCompanyDto, @User() user: IUser) {
    try {
      return this.companiesService.create(createCompanyDto, user);
    } catch (err) {
      throw new HttpException(err.message, err.statusCode);
    }
  }

  // get all company with pagination and search
  @Get('/get-all-company')
  findAll(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('q') queryString: string,
  ) {
    try {
      return this.companiesService.findAll(page, limit, queryString);
    } catch (error) {
      throw new HttpException(error.message, error.statusCode);
    }
  }

  // get company by id
  @Get('/get-company/:id')
  findOne(@Param('id') id: string) {
    try {
      return this.companiesService.findOne(id);
    } catch (err) {
      throw new HttpException(err.message, err.statusCode);
    }
  }

  // update company by id
  @Patch('/update-company/:id')
  update(
    @Param('id') id: string,
    @Body() updateCompanyDto: UpdateCompanyDto,
    @User() user: IUser,
  ) {
    try {
      return this.companiesService.update(id, updateCompanyDto, user);
    } catch (err) {
      throw new HttpException(err.message, err.statusCode);
    }
  }

  @Delete('/delete-company/:id')
  remove(@Param('id') id: string, @User() user: IUser) {
    try {
      return this.companiesService.remove(id, user);
    } catch (err) {
      throw new HttpException(err.message, err.statusCode);
    }
  }
}
