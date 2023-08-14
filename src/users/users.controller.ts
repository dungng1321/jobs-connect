import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
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

  // create new user
  @Post('create-new-user')
  create(@Body() createUserDto: CreateUserDto) {
    try {
      return this.usersService.create(createUserDto);
    } catch (err) {
      throw new HttpException(err.message, err.statusCode);
    }
  }

  // get all user with pagination and search
  @Get('/get-all-user')
  findAll(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('search') queryString: string,
  ) {
    try {
      return this.usersService.findAll(page, limit, queryString);
    } catch (err) {
      throw new HttpException(err.message, err.statusCode);
    }
  }

  // get user by id
  @Get('/get-user-by-id/:id')
  findOne(@Param('id') id: string) {
    try {
      return this.usersService.findOne(id);
    } catch (err) {
      throw new HttpException(err.message, err.statusCode);
    }
  }

  // update user by id
  @Patch('/update-user/:id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    try {
      return this.usersService.update(id, updateUserDto);
    } catch (err) {
      throw new HttpException(err.message, err.statusCode);
    }
  }

  // delete user by id
  @Delete('/delete-user/:id')
  remove(@Param('id') id: string) {
    try {
      return this.usersService.remove(id);
    } catch (err) {
      throw new HttpException(MESSAGE_ERROR.DELETE_USER_FAIL, err.statusCode);
    }
  }
}
