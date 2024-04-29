import { ApiProperty } from '@nestjs/swagger';

/**
 * Interface representing a base response.
 * @property {number} status - The HTTP status code of the base response. Example: 200
 * @property {string} message - A message describing the base response. Example: "ok"
 */
export interface IBaseResponse {
  status: number;
  message: string;
}

/**
 * Class representing a successful response.
 * @property {number} status - The HTTP status code of the successful response. Example: 200
 * @property {string} message - A message describing the successful response. Example: "ok"
 */
export class BaseResponse implements IBaseResponse {
  @ApiProperty({ description: 'status of the response' })
  status: number;

  @ApiProperty({ description: 'message of the response' })
  message: string;
}
