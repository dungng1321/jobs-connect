import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId } from 'mongoose';
import { CompanyDocument, Company } from './schemas/company.schema';
import { ResponseData } from 'src/constants/ReponseData';
import { HTTP_STATUS } from 'src/constants/httpStatusEnum';
import {
  MESSAGE_ERROR,
  MESSAGE_SUCCESS,
} from 'src/constants/constants.message';
import { IUser } from 'src/users/interface/user.interface';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { User } from 'src/decorator/customize';
import qs from 'qs';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectModel(Company.name)
    private companyModel: SoftDeleteModel<CompanyDocument>,
  ) {}

  // create new company
  async create(createCompanyDto: CreateCompanyDto, user: IUser) {
    const newCompany = this.companyModel.create({
      ...createCompanyDto,
      createdBy: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
    });
    const data = await newCompany;

    return new ResponseData(
      HTTP_STATUS.CREATED,
      MESSAGE_SUCCESS.CREATE_NEW_COMPANY_SUCCESS,
      data,
    );
  }

  // get all company with pagination and search
  async findAll(page: number, limit: number, queryString: string) {
    const searchQuery: any = qs.parse(queryString);

    const { name, address } = searchQuery;

    if (name) searchQuery.name = { $regex: name, $options: 'i' };
    if (address) searchQuery.address = { $regex: address, $options: 'i' };

    const totalCompany = await this.companyModel.countDocuments(searchQuery);

    let dataQuery = this.companyModel.find(searchQuery);

    if (page && limit) {
      const skip = limit * (page - 1);
      dataQuery = dataQuery.skip(skip).limit(limit);
    }

    const data = await dataQuery;
    const responseMeta = {
      currentPage: page || 1,
      totalUserInPage: data.length,
      totalUser: totalCompany,
      TotalPage: limit ? Math.ceil(totalCompany / limit) : 1,
      limit: limit || totalCompany,
    };

    return new ResponseData(HTTP_STATUS.OK, MESSAGE_SUCCESS.SUCCESS, {
      meta: responseMeta,
      data: data,
    });
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

    return new ResponseData(HTTP_STATUS.OK, MESSAGE_SUCCESS.SUCCESS, data);
  }

  // update company by id
  async update(id: string, updateCompanyDto: UpdateCompanyDto, user: IUser) {
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

    return new ResponseData(
      HTTP_STATUS.OK,
      MESSAGE_SUCCESS.UPDATE_COMPANY_SUCCESS,
      data,
    );
  }

  async remove(id: string, @User() user: IUser) {
    if (!isValidObjectId(id) || !(await this.companyModel.findById(id))) {
      throw new NotFoundException(MESSAGE_ERROR.COMPANY_NOT_FOUND);
    }

    // adđ deleteBy
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
    const data = await this.companyModel.softDelete({
      _id: id,
    });

    return new ResponseData(
      HTTP_STATUS.OK,
      MESSAGE_SUCCESS.DELETE_USER_SUCCESS,
      data,
    );
  }
}
