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
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RequestUser, ResponseMessage } from 'src/decorator/customize';
import { MESSAGE_SUCCESS } from 'src/constants/constants.message';
import { IUser } from 'src/users/interface/user.interface';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('roles')
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post('/create-new-role')
  @ResponseMessage(MESSAGE_SUCCESS.CREATE_NEW_ROLE_SUCCESS)
  create(@Body() createRoleDto: CreateRoleDto, @RequestUser() user: IUser) {
    try {
      return this.rolesService.create(createRoleDto, user);
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  @Get('/get-all-roles')
  @ResponseMessage(MESSAGE_SUCCESS.GET_ROLES_SUCCESS)
  findAll(
    @Body('current') currentPage: number,
    @Body('pageSize') pageSize: number,
    @Body() queryString: string,
  ) {
    try {
      return this.rolesService.findAll(currentPage, pageSize, queryString);
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  @Get('/get-role/:id')
  @ResponseMessage(MESSAGE_SUCCESS.GET_ROLE_SUCCESS)
  findOne(@Param('id') id: string) {
    try {
      return this.rolesService.findOne(id);
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  @Patch('/update-role/:id')
  @ResponseMessage(MESSAGE_SUCCESS.UPDATE_ROLE_SUCCESS)
  update(
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateRoleDto,
    @RequestUser() user: IUser,
  ) {
    try {
      return this.rolesService.update(id, updateRoleDto, user);
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  @Delete('/delete-role/:id')
  @ResponseMessage(MESSAGE_SUCCESS.DELETE_ROLE_SUCCESS)
  remove(@Param('id') id: string, @RequestUser() user: IUser) {
    try {
      return this.rolesService.remove(id, user);
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }
}
