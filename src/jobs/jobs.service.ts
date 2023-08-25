import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { isValidObjectId } from 'mongoose';
import app from 'api-query-params';

import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { Job, JobDocument } from './schemas/job.shema';
import { RequestUser } from 'src/decorator/customize';
import { IUser } from 'src/users/interface/user.interface';
import { MESSAGE_ERROR } from 'src/constants/constants.message';
import { validateDateOrder } from 'src/util/validateDateOrder';

@Injectable()
export class JobsService {
  constructor(
    @InjectModel(Job.name)
    private readonly jobModel: SoftDeleteModel<JobDocument>,
  ) {}

  // create new job
  async create(createJobDto: CreateJobDto, @RequestUser() user: IUser) {
    const { startDate, endDate } = createJobDto;

    if (!validateDateOrder(startDate, endDate)) {
      throw new BadRequestException(MESSAGE_ERROR.INVALID_END_DATE);
    }
    const newJob = await this.jobModel.create({
      ...createJobDto,
      createdBy: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
    });

    const data = newJob.toObject();

    return data;
  }

  // get all job with pagination and search
  async findAll(currentPage: number, limit: number, queryString: string) {
    const { filter, sort, population } = app(queryString);

    delete filter.current;
    delete filter.pageSize;

    const skip = (currentPage - 1) * limit;
    const defaultLimit = limit || 10;
    const totalItems = (await this.jobModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const data = await this.jobModel
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

  // get job by id
  async findOne(id: string) {
    if (!isValidObjectId(id) || !(await this.jobModel.findById(id))) {
      throw new NotFoundException(MESSAGE_ERROR.JOB_NOT_FOUND);
    }

    const job = await this.jobModel.findById(id).exec();

    if (!job) {
      throw new NotFoundException(MESSAGE_ERROR.JOB_NOT_FOUND);
    }

    const data = job.toObject();

    return data;
  }

  // update job
  async update(
    id: string,
    updateJobDto: UpdateJobDto,
    @RequestUser() user: IUser,
  ) {
    const { startDate, endDate } = updateJobDto;

    if (!startDate || !endDate) {
      throw new BadRequestException(MESSAGE_ERROR.INVALID_END_DATE);
    }

    if (!validateDateOrder(startDate, endDate)) {
      throw new BadRequestException(MESSAGE_ERROR.INVALID_END_DATE);
    }
    if (!isValidObjectId(id) || !(await this.jobModel.findById(id))) {
      throw new NotFoundException(MESSAGE_ERROR.JOB_NOT_FOUND);
    }

    const data = await this.jobModel.findByIdAndUpdate(
      id,
      {
        ...updateJobDto,
        updatedBy: {
          _id: user._id,
          name: user.name,
          email: user.email,
        },
      },
      { new: true },
    );

    return data;
  }

  // delete job soft delete
  async remove(id: string, @RequestUser() user: IUser) {
    if (!isValidObjectId(id) || !(await this.jobModel.findById(id))) {
      throw new NotFoundException(MESSAGE_ERROR.JOB_NOT_FOUND);
    }

    // add deleteBy
    await this.jobModel.findByIdAndUpdate(
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

    // use soft delete
    const data = this.jobModel.softDelete({
      _id: id,
    });

    return data;
  }
}
