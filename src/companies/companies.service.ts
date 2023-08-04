import { Injectable } from '@nestjs/common';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Company } from './schemas/company.schema';
import { Model } from 'mongoose';
import { CompanyDocument } from './schemas/company.schema';
import { ResponseData } from 'src/constants/ReponseData';
import { HTTP_STATUS } from 'src/constants/httpStatusEnum';
import { MESSAGE_SUCCESS } from 'src/constants/constants.message';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectModel(Company.name) private companyModel: Model<CompanyDocument>,
  ) {}

  // create new company
  async create(createCompanyDto: CreateCompanyDto) {
    const newCompany = await this.companyModel.create(createCompanyDto);
    const data = newCompany.toObject();

    return new ResponseData(
      HTTP_STATUS.CREATED,
      MESSAGE_SUCCESS.CREATE_NEW_COMPANY_SUCCESS,
      data,
    );
  }

  findAll() {
    return `This action returns all companies`;
  }

  findOne(id: number) {
    return `This action returns a #${id} company`;
  }

  update(id: number, updateCompanyDto: UpdateCompanyDto) {
    return `This action updates a #${id} company`;
  }

  remove(id: number) {
    return `This action removes a #${id} company`;
  }
}
