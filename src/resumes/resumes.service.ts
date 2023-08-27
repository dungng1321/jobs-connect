import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import app from 'api-query-params';

import { CreateResumeDto } from './dto/create-resume.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { Resume, ResumeDocument } from './schemas/resume.schema';
import { RequestUser } from 'src/decorator/customize';
import { IUser } from 'src/users/interface/user.interface';
import { ResumeStatus } from 'src/constants/constantsEnum';
import { isValidObjectId } from 'mongoose';
import { MESSAGE_ERROR } from 'src/constants/constants.message';

@Injectable()
export class ResumesService {
  constructor(
    @InjectModel(Resume.name)
    private resumeModel: SoftDeleteModel<ResumeDocument>,
  ) {}

  // create new resume
  async create(createResumeDto: CreateResumeDto, @RequestUser() user: IUser) {
    const newResume = await this.resumeModel.create({
      ...createResumeDto,
      email: user.email,
      userId: user._id,
      status: ResumeStatus.PENDING,
      createdBy: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
      history: [
        {
          status: ResumeStatus.PENDING,
          updatedAt: new Date(),
          updatedBy: {
            _id: user._id,
            name: user.name,
            email: user.email,
          },
        },
      ],
    });

    return {
      resume_id: newResume._id,
      email: newResume.email,
      created_at: newResume.createdAt,
    };
  }

  async findAll(currentPage: number, limit: number, queryString: string) {
    const { filter, sort, population, projection } = app(queryString);

    delete filter.current;
    delete filter.pageSize;

    const skip = (currentPage - 1) * limit;
    const defaultLimit = limit || 10;
    const totalItems = (await this.resumeModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const data = await this.resumeModel
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
    if (!isValidObjectId(id) || !(await this.resumeModel.findById(id))) {
      throw new NotFoundException(MESSAGE_ERROR.RESUME_NOT_FOUND);
    }

    const resume = await this.resumeModel.findById(id);

    return resume;
  }

  // find resume by user login
  async findByUserLogin(@RequestUser() user: IUser) {
    const resume = await this.resumeModel.findOne({
      userId: user._id,
    });

    return resume;
  }

  // update resume status
  async update(
    id: string,
    updateResumeDto: UpdateResumeDto,
    @RequestUser() user: IUser,
  ) {
    if (!isValidObjectId(id) || !(await this.resumeModel.findById(id))) {
      throw new NotFoundException(MESSAGE_ERROR.RESUME_NOT_FOUND);
    }

    const updateResume = await this.resumeModel.findByIdAndUpdate(
      id,
      {
        ...updateResumeDto,
        $push: {
          history: {
            status: updateResumeDto?.status,
            updatedAt: new Date(),
            updatedBy: {
              _id: user._id,
              name: user.name,
              email: user.email,
            },
          },
        },
        updatedBy: {
          _id: user._id,
          name: user.name,
          email: user.email,
        },
      },
      { new: true },
    );

    return updateResume;
  }

  async remove(id: string, @RequestUser() user: IUser) {
    if (!isValidObjectId(id) || !(await this.resumeModel.findById(id))) {
      throw new NotFoundException(MESSAGE_ERROR.RESUME_NOT_FOUND);
    }

    // add deleteBy
    await this.resumeModel.findByIdAndUpdate(
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

    // delete resume soft delete
    const data = this.resumeModel.softDelete({
      _id: id,
    });

    return data;
  }
}
