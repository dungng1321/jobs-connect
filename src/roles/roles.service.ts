import { BadRequestException, Injectable } from '@nestjs/common';
import { isValidObjectId } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import app from 'api-query-params';

import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role, RoleDocument } from './schemas/role.shema';

import { RequestUser } from 'src/decorator/customize';
import { IUser } from 'src/users/interface/user.interface';
import { MESSAGE_ERROR } from 'src/constants/constants.message';
import { Position } from 'src/constants/constantsEnum';

@Injectable()
export class RolesService {
  constructor(
    @InjectModel(Role.name)
    private roleModel: SoftDeleteModel<RoleDocument>,
  ) {}

  // create a role
  async create(createRoleDto: CreateRoleDto, @RequestUser() user: IUser) {
    const { name } = createRoleDto;

    const isExist = await this.roleModel.findOne({ name });

    if (isExist) {
      throw new BadRequestException(MESSAGE_ERROR.ROLE_EXIST);
    }

    const newRole = await this.roleModel.create({
      ...createRoleDto,
      createdBy: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
    });

    return newRole;
  }

  async findAll(currentPage: number, pageSize: number, queryString: string) {
    const { filter, sort, population, projection } = app(queryString);

    delete filter.current;
    delete filter.pageSize;

    const skip = (currentPage - 1) * pageSize;
    const defaultLimit = pageSize || 10;
    const totalItems = (await this.roleModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const data = await this.roleModel
      .find(filter)
      .skip(skip)
      .limit(defaultLimit)
      .sort(sort as any)
      .populate(population)
      .select(projection)
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
    if (!isValidObjectId(id) || !(await this.roleModel.findById(id))) {
      throw new BadRequestException(MESSAGE_ERROR.ROLE_NOT_FOUND);
    }

    const role = await this.roleModel.findById(id).populate({
      path: 'permissions',
      select: 'name apiPath method module',
    });

    return role;
  }

  async update(
    id: string,
    updateRoleDto: UpdateRoleDto,
    @RequestUser() user: IUser,
  ) {
    if (!isValidObjectId(id) || !(await this.roleModel.findById(id))) {
      throw new BadRequestException(MESSAGE_ERROR.ROLE_NOT_FOUND);
    }

    const updatedRole = await this.roleModel.findByIdAndUpdate(
      id,
      {
        ...updateRoleDto,
        updatedBy: {
          _id: user._id,
          name: user.name,
          email: user.email,
        },
      },
      { new: true },
    );

    return updatedRole;
  }

  async remove(id: string, @RequestUser() user: IUser) {
    if (!isValidObjectId(id) || !this.roleModel.findById(id)) {
      throw new BadRequestException(MESSAGE_ERROR.ROLE_NOT_FOUND);
    }

    const foundRole = await this.roleModel.findById(id);

    if (foundRole?.name === Position.ADMIN) {
      throw new BadRequestException(MESSAGE_ERROR.CANNOT_DELETE_ADMIN_ROLE);
    }
    // update deletedBy
    await this.roleModel.findByIdAndUpdate(
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

    return this.roleModel.softDelete({
      _id: id,
    });
  }
}
