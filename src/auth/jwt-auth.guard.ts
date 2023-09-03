import {
  Injectable,
  UnauthorizedException,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorator/customize';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    return super.canActivate(context);
  }

  handleRequest(
    err: any,
    user: any,
    info: { message: string | undefined },
    context: ExecutionContext,
  ) {
    const request: Request = context.switchToHttp().getRequest();

    if (err || !user) {
      throw err || new UnauthorizedException(info.message);
    }

    // check permission here

    const currentRoute = request.route?.path;
    const currentMethod = request.method;

    const userPermissions = user?.permissions ?? [];

    const isPermission = userPermissions.find(
      (permission: any) =>
        permission?.apiPath === currentRoute &&
        permission?.method === currentMethod,
    );

    if (!isPermission) {
      throw new ForbiddenException(`You don't have permission to access`);
    }

    return user;
  }
}
