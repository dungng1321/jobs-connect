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
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { RequestUser, ResponseMessage } from 'src/decorator/customize';
import { IUser } from 'src/users/interface/user.interface';
import { MESSAGE_SUCCESS } from 'src/constants/constants.message';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('permissions')
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post('/create-new-permission')
  @ResponseMessage(MESSAGE_SUCCESS.CREATE_NEW_PERMISSION_SUCCESS)
  create(
    @Body() createPermissionDto: CreatePermissionDto,
    @RequestUser() user: IUser,
  ) {
    try {
      return this.permissionsService.create(createPermissionDto, user);
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  @Get('/get-all-permissions')
  @ResponseMessage(MESSAGE_SUCCESS.GET_PERMISSIONS_SUCCESS)
  findAll(
    @Body('current') currentPage: number,
    @Body('pageSize') pageSize: number,
    @Body() queryString: string,
  ) {
    try {
      return this.permissionsService.findAll(
        currentPage,
        pageSize,
        queryString,
      );
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  @Get('/get-permission/:id')
  @ResponseMessage(MESSAGE_SUCCESS.GET_PERMISSION_SUCCESS)
  findOne(@Param('id') id: string) {
    try {
      return this.permissionsService.findOne(id);
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  @Patch('/update-permission/:id')
  @ResponseMessage(MESSAGE_SUCCESS.UPDATE_PERMISSION_SUCCESS)
  update(
    @Param('id') id: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
    @RequestUser() user: IUser,
  ) {
    try {
      return this.permissionsService.update(id, updatePermissionDto, user);
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  @Delete('/delete-permission/:id')
  @ResponseMessage(MESSAGE_SUCCESS.DELETE_PERMISSION_SUCCESS)
  remove(@Param('id') id: string, @RequestUser() user: IUser) {
    try {
      return this.permissionsService.remove(id, user);
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }
}
