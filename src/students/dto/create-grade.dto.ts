import { Type } from 'class-transformer';
import { IsNumber, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';
import { env } from '../../config/env';

export class CreateGradeDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  subject: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(env.minScore)
  @Max(env.maxScore)
  score: number;
}
