import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Role, RoleSchema } from './schemas/role.shema';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Role.name, schema: RoleSchema }]),
  ],
  controllers: [RolesController],
  providers: [RolesService],
})
export class RolesModule {}
