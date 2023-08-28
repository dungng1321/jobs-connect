import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsDefined,
  IsNotEmptyObject,
  IsObject,
  ValidateNested,
  IsInt,
  Min,
  IsMongoId,
} from 'class-validator';
import { Type } from 'class-transformer';
import mongoose from 'mongoose';

class Company {
  @IsNotEmpty()
  _id: mongoose.Schema.Types.ObjectId;

  @IsString()
  @IsNotEmpty()
  name: string;
}

//create user by admin
export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  // add min age
  @IsInt()
  @Min(0)
  age: number;

  @IsString()
  gender?: string;

  @IsString()
  address: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsMongoId()
  @IsNotEmpty()
  role: mongoose.Schema.Types.ObjectId;

  @IsDefined()
  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @Type(() => Company)
  company: Company;
}

//register user by user
export class RegisterUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsInt()
  @Min(0)
  age: number;

  @IsString()
  gender: string;

  @IsString()
  address: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
