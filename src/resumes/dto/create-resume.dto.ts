import { IsMongoId, IsNotEmpty } from 'class-validator';

export class CreateResumeDto {
  @IsNotEmpty()
  url: string;

  @IsNotEmpty()
  @IsMongoId()
  company: string;

  @IsNotEmpty()
  @IsMongoId()
  job: string;
}
