import {
  IsInt,
  IsDateString,
  IsEnum,
  IsArray,
  ValidateNested,
  Min,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export enum MatchResult {
  WIN = 'WIN',
  LOSE = 'LOSE',
}

export class MatchData {
  @ApiProperty({ description: 'Rule ID', example: 1, type: Number })
  @IsInt()
  @Min(1)
  ruleId: number;

  @ApiProperty({ description: 'Weapon ID', example: 1, type: Number })
  @IsInt()
  @Min(1)
  weaponId: number;

  @ApiProperty({ description: 'Stage ID', example: 1, type: Number })
  @IsInt()
  @Min(1)
  stageId: number;

  @ApiProperty({ description: 'Battle Type ID', example: 1, type: Number })
  @IsInt()
  @Min(1)
  battleTypeId: number;

  @ApiProperty({
    description: 'Match result',
    enum: MatchResult,
    example: MatchResult.WIN,
  })
  @IsEnum(MatchResult)
  result: MatchResult;

  @ApiProperty({
    description: 'Game date and time (ISO8601)',
    example: '2024-11-24T10:30:00Z',
  })
  @IsDateString()
  gameDateTime: string;

  @ApiProperty({
    description: 'Points earned',
    example: 1500,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  point?: number;
}

export class BulkCreateMatchesRequest {
  @ApiProperty({
    type: [MatchData],
    description: 'Array of matches to create',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MatchData)
  matches: MatchData[];
}

export class BulkCreateMatchesResponse {
  @ApiProperty({ description: 'Operation success status', example: true })
  success: boolean;
}
