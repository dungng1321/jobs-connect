import { BadRequestException, Injectable } from '@nestjs/common';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { InjectModel } from '@nestjs/mongoose';
import app from 'api-query-params';

import { CreateSubscriberDto } from './dto/create-subscriber.dto';
import { UpdateSubscriberDto } from './dto/update-subscriber.dto';
import { Subscriber, SubscriberDocument } from './schemas/subscriber.schema';
import { MESSAGE_ERROR } from 'src/constants/constants.message';
import { RequestUser } from 'src/decorator/customize';
import { IUser } from 'src/users/interface/user.interface';
import { isValidObjectId } from 'mongoose';

@Injectable()
export class SubscribersService {
  constructor(
    @InjectModel(Subscriber.name)
    private readonly subscriberModel: SoftDeleteModel<SubscriberDocument>,
  ) {}

  // create new subscriber
  async create(
    createSubscriberDto: CreateSubscriberDto,
    @RequestUser() user: IUser,
  ) {
    const { email } = createSubscriberDto;

    const isExist = await this.subscriberModel.findOne({ email });

    if (isExist) {
      throw new BadRequestException(MESSAGE_ERROR.EMAIL_EXIST);
    }

    const newSubscriber = await this.subscriberModel.create({
      ...createSubscriberDto,
      createdBy: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
    });

    return newSubscriber;
  }

  // get all subscribers
  async findAll(currentPage: number, limit: number, queryString: string) {
    const { filter, sort, population } = app(queryString);

    delete filter.current;
    delete filter.pageSize;

    const skip = (currentPage - 1) * limit;
    const defaultLimit = limit || 10;
    const totalItems = (await this.subscriberModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const data = this.subscriberModel
      .find(filter)
      .skip(skip)
      .limit(defaultLimit)
      .sort(sort as any)
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

  // get subscriber by id
  async findOne(id: string) {
    if (!isValidObjectId(id) || !(await this.subscriberModel.findById(id))) {
      throw new BadRequestException(MESSAGE_ERROR.SUBSCRIBER_NOT_FOUND);
    }

    const subscriber = await this.subscriberModel.findById(id).exec();

    if (!subscriber) {
      throw new BadRequestException(MESSAGE_ERROR.SUBSCRIBER_NOT_FOUND);
    }

    const data = subscriber.toObject();

    return data;
  }

  // update subscriber by id
  async update(
    updateSubscriberDto: UpdateSubscriberDto,
    @RequestUser() user: IUser,
  ) {
    const { email } = updateSubscriberDto;

    const isExist = await this.subscriberModel.findOne({ email });

    if (isExist) {
      throw new BadRequestException(MESSAGE_ERROR.EMAIL_EXIST);
    }

    const subscriber = await this.subscriberModel.updateOne(
      { email: user.email },
      {
        ...updateSubscriberDto,
        updatedBy: {
          _id: user._id,
          name: user.name,
          email: user.email,
        },
      },
      { upsert: true },
    );

    return subscriber;
  }

  // delete subscriber by id
  async remove(id: string, @RequestUser() user: IUser) {
    if (!isValidObjectId(id) || !(await this.subscriberModel.findById(id))) {
      throw new BadRequestException(MESSAGE_ERROR.SUBSCRIBER_NOT_FOUND);
    }

    // update field deletedBy
    await this.subscriberModel.findByIdAndUpdate(
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

    // delete subscriber
    const data = await this.subscriberModel.softDelete({
      _id: id,
    });

    return data;
  }
}
