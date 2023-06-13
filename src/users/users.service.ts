import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model, isValidObjectId } from 'mongoose';
import { hashPassword } from 'src/util/hashPassword';
import {
  MESSAGE_ERROR,
  MESSAGE_SUCCESS,
} from 'src/constants/constants.message';
import { ResponseData } from 'src/constants/ReponseData';
import { HTTP_STATUS } from 'src/constants/httpStatusEnum';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  // create new user width async await
  async create(createUserDto: CreateUserDto) {
    const { password, ...rest } = createUserDto;

    const existingUser = await this.userModel.findOne({ email: rest.email });
    if (existingUser) {
      throw new BadRequestException(MESSAGE_ERROR.EMAIL_EXIST);
    }

    const hashedPassword = await hashPassword(password);
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

  // get all user
  async findAll() {
    const users = await this.userModel.find();
    const data = users.map((user) => user.toObject());

    return new ResponseData(HTTP_STATUS.OK, MESSAGE_SUCCESS.SUCCESS, data);
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

    const data = await this.userModel.findByIdAndDelete(id);

    return new ResponseData(
      HTTP_STATUS.OK,
      MESSAGE_SUCCESS.DELETE_USER_SUCCESS,
      data,
    );
  }
}
