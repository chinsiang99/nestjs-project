import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IBaseResponse } from './base-response.interface';
import { IJwtToken } from '../interfaces/jwt-token.interface';

// export interface IJwtTokenObject {
//     accessToken: string
//     refreshToken: string
// }

/**
 * Interface representing a base response.
 * @property {number} status - The HTTP status code of the base response. Example: 200
 * @property {string} message - A message describing the base response. Example: "ok"
 */
export interface ILoginResponse extends IBaseResponse {
  data: IJwtToken;
}

export class JwtTokenObject implements IJwtToken {
  @ApiProperty({ description: 'jwt access token' })
  accessToken: string;

  @ApiProperty({ description: 'jwt refresh token' })
  refreshToken: string;
}

/**
 * Class representing a successful response.
 * @property {number} status - The HTTP status code of the successful response. Example: 200
 * @property {string} message - A message describing the successful response. Example: "ok"
 */
export class LoginResponse implements ILoginResponse {
  @ApiProperty({ description: 'status of the response' })
  status: number;

  @ApiProperty({ description: 'message of the response' })
  message: string;

  @ApiPropertyOptional({ description: 'data of the response' })
  data: JwtTokenObject;
}
