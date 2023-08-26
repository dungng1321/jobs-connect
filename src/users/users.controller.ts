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
import {
  MESSAGE_ERROR,
  MESSAGE_SUCCESS,
} from 'src/constants/constants.message';
import { ResponseMessage, RequestUser } from 'src/decorator/customize';
import { IUser } from './interface/user.interface';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // create new user
  @Post('create-new-user')
  @ResponseMessage(MESSAGE_SUCCESS.CREATE_NEW_USER_SUCCESS)
  create(@Body() createUserDto: CreateUserDto, @RequestUser() user: IUser) {
    try {
      return this.usersService.create(createUserDto, user);
    } catch (err) {
      throw new HttpException(err.message, err.statusCode);
    }
  }

  // get all user with pagination and search
  @Get('/get-all-users')
  @ResponseMessage(MESSAGE_SUCCESS.GET_USERS_SUCCESS)
  findAll(
    @Query('current') currentPage: number,
    @Query('pageSize') limit: number,
    @Query() queryString: string,
  ) {
    try {
      return this.usersService.findAll(currentPage, limit, queryString);
    } catch (err) {
      throw new HttpException(err.message, err.statusCode);
    }
  }

  // get user by id
  @Get('/get-user/:id')
  @ResponseMessage(MESSAGE_SUCCESS.GET_USER_SUCCESS)
  findOne(@Param('id') id: string) {
    try {
      return this.usersService.findOne(id);
    } catch (err) {
      throw new HttpException(err.message, err.statusCode);
    }
  }

  // update user by id
  @Patch('/update-user/:id')
  @ResponseMessage(MESSAGE_SUCCESS.UPDATE_USER_SUCCESS)
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @RequestUser() user: IUser,
  ) {
    try {
      return this.usersService.update(id, updateUserDto, user);
    } catch (err) {
      throw new HttpException(err.message, err.statusCode);
    }
  }

  // delete user by id
  @Delete('/delete-user/:id')
  @ResponseMessage(MESSAGE_SUCCESS.DELETE_USER_SUCCESS)
  remove(@Param('id') id: string, @RequestUser() user: IUser) {
    try {
      return this.usersService.remove(id, user);
    } catch (err) {
      throw new HttpException(MESSAGE_ERROR.DELETE_USER_FAIL, err.statusCode);
    }
  }
}
