import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import app from 'api-query-params';

import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { Permission, PermissionDocument } from './schemas/permission.shema';
import { RequestUser } from 'src/decorator/customize';
import { IUser } from 'src/users/interface/user.interface';
import { MESSAGE_ERROR } from 'src/constants/constants.message';
import { isValidObjectId } from 'mongoose';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectModel(Permission.name)
    private permissionModel: SoftDeleteModel<PermissionDocument>,
  ) {}

  // create a permission
  async create(
    createPermissionDto: CreatePermissionDto,
    @RequestUser() user: IUser,
  ) {
    const { apiPath, method } = createPermissionDto;

    const isExist = await this.permissionModel.findOne({ apiPath, method });

    if (isExist) {
      throw new BadRequestException(MESSAGE_ERROR.PERMISSION_EXIST);
    }

    const newPermission = await this.permissionModel.create({
      ...createPermissionDto,
      createdBy: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
    });

    return newPermission;
  }

  async findAll(currentPage: number, pageSize: number, queryString: string) {
    const { filter, sort, population, projection } = app(queryString);

    delete filter.current;
    delete filter.pageSize;

    const skip = (currentPage - 1) * pageSize;
    const defaultLimit = pageSize || 10;
    const totalItems = (await this.permissionModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const data = await this.permissionModel
      .find(filter)
      .skip(skip)
      .limit(defaultLimit)
      .sort(sort as any)
      .select(projection)
      .populate(population)
      .exec();

    return {
      meta: {
        currentPage,
        pageSize: defaultLimit,
        totalPages,
        totalItems,
      },
      data,
    };
  }

  async findOne(id: string) {
    if (!isValidObjectId(id) || !(await this.permissionModel.findById(id))) {
      throw new BadRequestException(MESSAGE_ERROR.PERMISSION_NOT_FOUND);
    }

    const permission = await this.permissionModel.findById(id);

    return permission;
  }

  async update(
    id: string,
    updatePermissionDto: UpdatePermissionDto,
    @RequestUser() user: IUser,
  ) {
    if (!isValidObjectId(id) || !(await this.permissionModel.findById(id))) {
      throw new BadRequestException(MESSAGE_ERROR.PERMISSION_NOT_FOUND);
    }

    const updatePermission = await this.permissionModel.findByIdAndUpdate(
      id,
      {
        ...updatePermissionDto,
        updatedBy: {
          _id: user._id,
          name: user.name,
          email: user.email,
        },
      },
      { new: true },
    );

    return updatePermission;
  }

  async remove(id: string, @RequestUser() user: IUser) {
    if (!isValidObjectId(id) || !(await this.permissionModel.findById(id))) {
      throw new BadRequestException(MESSAGE_ERROR.PERMISSION_NOT_FOUND);
    }

    // update deletedBy
    await this.permissionModel.findByIdAndUpdate(
      id,
      {
        deletedBy: {
          _id: user._id,
          name: user.name,
          email: user.email,
        },
      },
      { new: true },
    );

    const data = this.permissionModel.softDelete({
      _id: id,
    });

    return data;
  }
}
