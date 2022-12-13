import { IsNumber, IsOptional } from 'class-validator';

export class QueryDto {
  @IsNumber()
  @IsOptional()
  limit?: number;

  @IsNumber()
  @IsOptional()
  skip?: number;
}
