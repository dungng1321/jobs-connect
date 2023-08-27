import { Test, TestingModule } from '@nestjs/testing';
import { ResumesController } from './resumes.controller';
import { ResumesService } from './resumes.service';

describe('ResumesController', () => {
  let controller: ResumesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ResumesController],
      providers: [ResumesService],
    }).compile();

    controller = module.get<ResumesController>(ResumesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
