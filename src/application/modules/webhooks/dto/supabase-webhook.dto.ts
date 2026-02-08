import { IsString, IsEmail, IsObject, IsOptional, IsIn } from 'class-validator';

export class SupabaseUserRecord {
  @IsString()
  id: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  email_confirmed_at?: string | null;

  @IsOptional()
  @IsObject()
  user_metadata?: {
    full_name?: string;
    role?: string;
    avatar_url?: string;
  };
}

export class SupabaseWebhookDto {
  @IsString()
  @IsIn(['INSERT', 'UPDATE', 'DELETE'])
  type: string;

  @IsString()
  table: string;

  @IsObject()
  record: SupabaseUserRecord;

  @IsObject()
  @IsOptional()
  old_record?: any;
}
