import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import qs from 'qs';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { isValidObjectId } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

import { CreateUserDto, RegisterUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './schemas/user.schema';
import { hashPassword } from 'src/util/hashPassword';
import { MESSAGE_ERROR } from 'src/constants/constants.message';
import { IUser } from './interface/user.interface';
import { RequestUser } from 'src/decorator/customize';
import { Position } from 'src/constants/positionEnum';

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
  async findAll(page: number, limit: number, queryString: string) {
    const searchQuery = qs.parse(queryString, { ignoreQueryPrefix: true });

    const { age, name, address, email } = searchQuery;
    const filter: any = {};

    if (age) filter.age = +age;
    if (name) filter.name = { $regex: name, $options: 'i' };
    if (address) filter.address = { $regex: address, $options: 'i' };
    if (email) filter.email = { $regex: email, $options: 'i' };

    const totalUser = await this.userModel.countDocuments(filter);

    let dataQuery = this.userModel.find(filter).select('-password');
    if (page && limit) {
      const skip = (page - 1) * limit;
      dataQuery = dataQuery.skip(skip).limit(limit);
    }

    const data = await dataQuery;
    const responseMeta = {
      currentPage: page || 1,
      totalUserInPage: data.length,
      totalUser: totalUser,
      TotalPage: limit ? Math.ceil(totalUser / limit) : 1,
      limit: limit || totalUser,
    };

    return {
      meta: responseMeta,
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
      .findByIdAndUpdate(id, {
        ...updateUserDto,
        updatedBy: {
          _id: user._id,
          name: user.name,
        },
      })
      .select('-password');
    return data;
  }

  // delete user
  async remove(id: string, @RequestUser() user: IUser) {
    if (!isValidObjectId(id) || !(await this.userModel.findById(id))) {
      throw new NotFoundException(MESSAGE_ERROR.USER_NOT_FOUND);
    }

    // add deleteBy
    await this.userModel.findByIdAndUpdate(id, {
      deletedBy: {
        _id: user._id,
        name: user.name,
      },
    });

    // use soft delete
    const data = await this.userModel.softDelete({
      _id: id,
    });

    return data;
  }

  // check and update user with refresh token and save to cookies
  async updateRefreshToken(id: string, refreshToken: string) {
    const updateData = await this.userModel.findByIdAndUpdate(id, {
      refreshToken: refreshToken,
    });

    return updateData;
  }
}
