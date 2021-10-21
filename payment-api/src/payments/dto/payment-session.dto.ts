import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class PaymentSessionDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  sessionId: string;
}
