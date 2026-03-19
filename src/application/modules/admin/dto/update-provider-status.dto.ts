import { IsIn, IsString } from 'class-validator';

export class UpdateProviderStatusDto {
  @IsString()
  @IsIn(['ACTIVE', 'INACTIVE', 'SUSPENDED'], { message: 'Invalid status' })
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
}
