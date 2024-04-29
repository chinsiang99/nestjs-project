import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { IUserPayload } from 'src/utils/interfaces/user-payload.interface';

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
    });
  }

  validate(payload: IUserPayload) {
    if (!payload) {
      throw new UnauthorizedException('Unauthorized');
    }
    return payload;
  }

  // This method will be called after validation
  authenticate(req: Request, options?: any) {
    super.authenticate(req, options);
    req.user = req.authInfo; // Attach user payload to the request object
  }
}
