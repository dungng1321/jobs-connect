import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { isValidObjectId } from 'mongoose';

import { hashPassword } from 'src/util/hashPassword';
import { MESSAGE_ERROR } from 'src/constants/constants.message';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { UserDocument } from './schemas/user.schema';
import qs from 'qs';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: SoftDeleteModel<UserDocument>,
  ) {}

  // create new user
  async create(createUserDto: CreateUserDto) {
    const { password, ...rest } = createUserDto;

    const existingUser = await this.userModel.findOne({ email: rest.email });
    if (existingUser) {
      throw new BadRequestException(MESSAGE_ERROR.EMAIL_EXIST);
    }

    const hashedPassword = hashPassword(password);
    const newUser = await this.userModel.create({
      ...rest,
      password: hashedPassword,
    });

    const data = newUser.toObject();

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

    let dataQuery = this.userModel.find(filter);
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
      data: data,
    };
  }

  // get user by id
  async findOne(id: string) {
    if (!isValidObjectId(id)) {
      throw new NotFoundException(MESSAGE_ERROR.USER_NOT_FOUND);
    }
    const user = await this.userModel.findById(id);
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
  async update(id: string, updateUserDto: UpdateUserDto) {
    if (!isValidObjectId(id) || !(await this.userModel.findById(id))) {
      throw new NotFoundException(MESSAGE_ERROR.USER_NOT_FOUND);
    }

    const data = await this.userModel.findByIdAndUpdate(id, updateUserDto, {
      new: true,
    });

    return data;
  }

  // delete user
  async remove(id: string) {
    if (!isValidObjectId(id) || !(await this.userModel.findById(id))) {
      throw new NotFoundException(MESSAGE_ERROR.USER_NOT_FOUND);
    }

    const data = await this.userModel.softDelete({
      _id: id,
    });

    return data;
  }
}
