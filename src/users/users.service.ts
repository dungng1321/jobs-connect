import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { isValidObjectId } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import app from 'api-query-params';

import { CreateUserDto, RegisterUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './schemas/user.schema';
import { hashPassword } from 'src/util/hashPassword';
import { MESSAGE_ERROR } from 'src/constants/constants.message';
import { IUser } from './interface/user.interface';
import { RequestUser } from 'src/decorator/customize';
import { Position } from 'src/constants/constantsEnum';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: SoftDeleteModel<UserDocument>,
  ) {}

  // create new user by admin
  async create(createUserDto: CreateUserDto, @RequestUser() user: IUser) {
    const { password, ...rest } = createUserDto;

    const existingUser = await this.userModel.findOne({ email: rest.email });
    if (existingUser) {
      throw new BadRequestException(MESSAGE_ERROR.EMAIL_EXIST);
    }

    const hashedPassword = hashPassword(password);
    const newUser = await this.userModel.create({
      ...rest,
      password: hashedPassword,
      createdBy: {
        _id: user._id,
        name: user.name,
      },
    });

    // retutn user without password , select('-password')
    const data = await this.userModel.findById(newUser._id).select('-password');

    return data;
  }

  // register user
  async register(registerUserDto: RegisterUserDto) {
    const { password, ...rest } = registerUserDto;

    const existingUser = await this.userModel.findOne({ email: rest.email });
    if (existingUser) {
      throw new BadRequestException(MESSAGE_ERROR.EMAIL_EXIST);
    }

    const hashedPassword = hashPassword(password);
    const newUser = await this.userModel.create({
      role: Position.USER,
      password: hashedPassword,
      ...rest,
    });

    const data = await this.userModel.findById(newUser._id).select('-password');
    return data;
  }

  // get all user with pagination and filter
  async findAll(currentPage: number, limit: number, queryString: string) {
    const { filter, sort, population } = app(queryString);

    delete filter.current;
    delete filter.pageSize;

    const skip = (currentPage - 1) * limit;
    const defaultLimit = limit || 10;
    const totalItems = (await this.userModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const data = await this.userModel
      .find(filter)
      .skip(skip)
      .limit(defaultLimit)
      .sort(sort as any)
      .select('-password')
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

  // get user by id
  async findOne(id: string) {
    if (!isValidObjectId(id)) {
      throw new NotFoundException(MESSAGE_ERROR.USER_NOT_FOUND);
    }
    const user = await this.userModel.findById(id).select('-password');
    if (!user) {
      throw new NotFoundException(MESSAGE_ERROR.USER_NOT_FOUND);
    }

    const data = user.toObject();
    return data;
  }

  // find user by username
  async findByUsername(username: string) {
    const user = await this.userModel.findOne({ email: username });
    if (!user) {
      throw new NotFoundException(MESSAGE_ERROR.USER_NOT_FOUND);
    }

    const data = user.toObject();

    return data;
  }

  // update user
  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    @RequestUser() user: IUser,
  ) {
    if (!isValidObjectId(id) || !(await this.userModel.findById(id))) {
      throw new NotFoundException(MESSAGE_ERROR.USER_NOT_FOUND);
    }

    const data = await this.userModel
      .findByIdAndUpdate(
        id,
        {
          ...updateUserDto,
          updatedBy: {
            _id: user._id,
            name: user.name,
          },
        },
        { new: true },
      )
      .select('-password');
    return data;
  }

  // delete user
  async remove(id: string, @RequestUser() user: IUser) {
    if (!isValidObjectId(id) || !(await this.userModel.findById(id))) {
      throw new NotFoundException(MESSAGE_ERROR.USER_NOT_FOUND);
    }

    // add deleteBy
    await this.userModel.findByIdAndUpdate(
      id,
      {
        deletedBy: {
          _id: user._id,
          name: user.name,
        },
      },
      { new: true },
    );

    // use soft delete
    const data = await this.userModel.softDelete({
      _id: id,
    });

    return data;
  }

  // save refresh token to db
  async updateRefreshTokenField(id: string, refreshToken: string) {
    const updateData = await this.userModel.findByIdAndUpdate(
      id,
      {
        refreshToken: refreshToken,
      },
      { new: true },
    );

    return updateData;
  }
}
