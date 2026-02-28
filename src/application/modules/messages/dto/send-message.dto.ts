import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';

export class SendMessageDto {
  @IsUUID()
  @IsNotEmpty()
  requestId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  content: string;
}

