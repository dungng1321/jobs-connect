import { IsNotEmpty } from 'class-validator';

export class UpdateResumeDto {
  @IsNotEmpty()
  status: string;
}
