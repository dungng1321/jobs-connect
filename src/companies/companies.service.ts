import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId } from 'mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import app from 'api-query-params';

import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { CompanyDocument, Company } from './schemas/company.schema';
import { IUser } from 'src/users/interface/user.interface';
import { RequestUser } from 'src/decorator/customize';
import { MESSAGE_ERROR } from 'src/constants/constants.message';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectModel(Company.name)
    private companyModel: SoftDeleteModel<CompanyDocument>,
  ) {}

  // create new company
  async create(createCompanyDto: CreateCompanyDto, @RequestUser() user: IUser) {
    const newCompany = await this.companyModel.create({
      ...createCompanyDto,
      createdBy: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
    });

    const data = newCompany.toObject();

    return data;
  }

  // get all company with pagination and search
  async findAll(currentPage: number, limit: number, queryString: string) {
    const { filter, sort, population } = app(queryString);

    delete filter.current;
    delete filter.pageSize;

    const skip = (currentPage - 1) * limit;
    const defaultLimit = limit || 10;
    const totalItems = (await this.companyModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const data = await this.companyModel
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

  // get company by id
  async findOne(id: string) {
    if (!isValidObjectId(id) || !(await this.companyModel.findById(id))) {
      throw new NotFoundException(MESSAGE_ERROR.COMPANY_NOT_FOUND);
    }

    const company = await this.companyModel.findById(id);

    if (!company) {
      throw new NotFoundException(MESSAGE_ERROR.COMPANY_NOT_FOUND);
    }

    const data = company.toObject();

    return data;
  }

  // update company by id
  async update(
    id: string,
    updateCompanyDto: UpdateCompanyDto,
    @RequestUser() user: IUser,
  ) {
    if (!isValidObjectId(id) || !(await this.companyModel.findById(id))) {
      throw new NotFoundException(MESSAGE_ERROR.COMPANY_NOT_FOUND);
    }

    const data = await this.companyModel.findByIdAndUpdate(
      id,
      {
        ...updateCompanyDto,
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

  async remove(id: string, @RequestUser() user: IUser) {
    if (!isValidObjectId(id) || !(await this.companyModel.findById(id))) {
      throw new NotFoundException(MESSAGE_ERROR.COMPANY_NOT_FOUND);
    }

    // add deleteBy
    await this.companyModel.findByIdAndUpdate(
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
    const data = this.companyModel.softDelete({
      _id: id,
    });

    return data;
  }
}
