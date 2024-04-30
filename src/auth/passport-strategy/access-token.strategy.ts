import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
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

  /**
   * Validates the payload extracted from the JWT access token.
   * @param {IUserPayload} payload - The payload extracted from the JWT access token.
   * @returns {IUserPayload} The validated user payload. - note that it will attach to the request.user directly
   * @throws {UnauthorizedException} Throws an error if the payload is invalid or missing.
   */
  validate(payload: IUserPayload) {
    if (!payload) {
      throw new UnauthorizedException('Unauthorized');
    }
    return payload;
  }
}
