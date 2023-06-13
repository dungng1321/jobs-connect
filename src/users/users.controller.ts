import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { MESSAGE_ERROR } from 'src/constants/constants.message';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('create-new-user')
  create(@Body() createUserDto: CreateUserDto) {
    try {
      return this.usersService.create(createUserDto);
    } catch (err) {
      throw new HttpException(err.message, err.statusCode);
    }
  }

  @Get('/get-all-user')
  findAll() {
    try {
      return this.usersService.findAll();
    } catch (err) {
      throw new HttpException(err.message, err.statusCode);
    }
  }

  @Get('/get-user-by-id/:id')
  findOne(@Param('id') id: string) {
    try {
      return this.usersService.findOne(id);
    } catch (err) {
      throw new HttpException(err.message, err.statusCode);
    }
  }

  @Patch('/update-user/:id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    try {
      return this.usersService.update(id, updateUserDto);
    } catch (err) {
      throw new HttpException(err.message, err.statusCode);
    }
  }

  @Delete('/delete-user/:id')
  remove(@Param('id') id: string) {
    try {
      return this.usersService.remove(id);
    } catch (err) {
      throw new HttpException(MESSAGE_ERROR.DELETE_USER_FAIL, err.statusCode);
    }
  }
}
