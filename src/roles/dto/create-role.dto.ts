import {
  IsArray,
  IsBoolean,
  IsMongoId,
  IsNotEmpty,
  IsString,
} from 'class-validator';
import mongoose from 'mongoose';

export class CreateRoleDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsBoolean()
  isActive: boolean;

  @IsNotEmpty()
  @IsArray()
  @IsMongoId({ each: true })
  permissions: mongoose.Schema.Types.ObjectId[];
}
