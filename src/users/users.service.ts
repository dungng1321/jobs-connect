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
import {
  MESSAGE_ERROR,
  MESSAGE_SUCCESS,
} from 'src/constants/constants.message';
import { ResponseData } from 'src/constants/ReponseData';
import { HTTP_STATUS } from 'src/constants/httpStatusEnum';
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

    return new ResponseData(
      HTTP_STATUS.CREATED,
      MESSAGE_SUCCESS.CREATE_NEW_USER_SUCCESS,
      data,
    );
  }

  // get all user with pagination and search
  async findAll(page: number, limit: number, queryString: string) {
    const searchQuery: any = qs.parse(queryString);

    const { age, name, address, email } = searchQuery;

    if (age) searchQuery.age = +age;
    if (name) searchQuery.name = { $regex: name, $options: 'i' };
    if (address) searchQuery.address = { $regex: address, $options: 'i' };
    if (email) searchQuery.email = { $regex: email, $options: 'i' };

    const totalUser = await this.userModel.countDocuments(searchQuery);

    let dataQuery = this.userModel.find(searchQuery);
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

    return new ResponseData(HTTP_STATUS.OK, MESSAGE_SUCCESS.SUCCESS, {
      meta: responseMeta,
      data: data,
    });
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

    return new ResponseData(HTTP_STATUS.OK, MESSAGE_SUCCESS.SUCCESS, data);
  }

  // find user by username
  async findByUsername(username: string) {
    const user = await this.userModel.findOne({ email: username });
    if (!user) {
      throw new NotFoundException(MESSAGE_ERROR.USER_NOT_FOUND);
    }

    const data = user.toObject();

    return new ResponseData(HTTP_STATUS.OK, MESSAGE_SUCCESS.SUCCESS, data);
  }

  // update user
  async update(id: string, updateUserDto: UpdateUserDto) {
    if (!isValidObjectId(id)) {
      throw new NotFoundException(MESSAGE_ERROR.USER_NOT_FOUND);
    }

    const data = await this.userModel.findByIdAndUpdate(id, updateUserDto, {
      new: true,
    });

    return new ResponseData(HTTP_STATUS.OK, MESSAGE_SUCCESS.SUCCESS, data);
  }

  // delete user
  async remove(id: string) {
    if (!isValidObjectId(id) || !(await this.userModel.findById(id))) {
      throw new NotFoundException(MESSAGE_ERROR.USER_NOT_FOUND);
    }

    const data = await this.userModel.softDelete({
      _id: id,
    });

    return new ResponseData(
      HTTP_STATUS.OK,
      MESSAGE_SUCCESS.DELETE_USER_SUCCESS,
      data,
    );
  }
}
