import {
  IsInt,
  IsDateString,
  IsEnum,
  IsArray,
  ValidateNested,
  Min,
  IsOptional,
  IsUUID,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export enum MatchResult {
  WIN = 'WIN',
  LOSE = 'LOSE',
}

// API Layer: リクエストボディ内の個別試合データ
export class CreateMatchBody {
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
    type: String,
  })
  @IsEnum(MatchResult)
  result: MatchResult;

  @ApiProperty({
    description: 'Game date and time (ISO8601)',
    example: '2024-11-24T10:30:00Z',
    type: String,
  })
  @IsDateString()
  gameDateTime: string;

  @ApiProperty({
    description: 'Points earned',
    example: 1500,
    required: false,
    type: Number,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  point?: number;
}

export class BulkCreateMatchesRequest {
  @ApiProperty({
    type: [CreateMatchBody],
    description: 'Array of matches to create',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMatchBody)
  matches: CreateMatchBody[];
}

export class BulkCreateMatchesResponse {
  @ApiProperty({ description: 'Operation success status', example: true, type: Boolean })
  success: boolean;
}

export enum SearchOperator {
  AND = 'AND',
  OR = 'OR',
}

export class SearchMatchesRequest {
  @ApiProperty({
    description: 'Weapon IDs to filter by',
    type: [Number],
    required: false,
    example: [1, 2],
  })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  weapons?: number[];

  @ApiProperty({
    description: 'Stage IDs to filter by',
    type: [Number],
    required: false,
    example: [3, 4],
  })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  stages?: number[];

  @ApiProperty({
    description: 'Rule IDs to filter by',
    type: [Number],
    required: false,
    example: [1],
  })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  rules?: number[];

  @ApiProperty({
    description: 'Battle Type IDs to filter by',
    type: [Number],
    required: false,
    example: [1],
  })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  battleTypes?: number[];

  @ApiProperty({
    description: 'Match results to filter by',
    enum: MatchResult,
    type: [String],
    required: false,
    example: ['WIN'],
  })
  @IsOptional()
  @IsArray()
  @IsEnum(MatchResult, { each: true })
  results?: MatchResult[];

  @ApiProperty({
    description: 'Start date and time (ISO8601)',
    type: String,
    required: false,
    example: '2024-11-01T00:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  startDateTime?: string;

  @ApiProperty({
    description: 'End date and time (ISO8601)',
    type: String,
    required: false,
    example: '2024-11-30T23:59:59Z',
  })
  @IsOptional()
  @IsDateString()
  endDateTime?: string;

  @ApiProperty({
    description: 'Search operator (AND or OR)',
    enum: SearchOperator,
    example: SearchOperator.AND,
    type: String,
  })
  @IsEnum(SearchOperator)
  operator: SearchOperator;

  @ApiProperty({
    description: 'Page number (1-based)',
    example: 1,
    type: Number,
  })
  @IsInt()
  @Min(1)
  page: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 50,
    type: Number,
  })
  @IsInt()
  @Min(1)
  pageCount: number;
}

export class MatchResponse {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: Number })
  weaponId: number;

  @ApiProperty({ type: Number })
  stageId: number;

  @ApiProperty({ type: Number })
  ruleId: number;

  @ApiProperty({ type: Number })
  battleTypeId: number;

  @ApiProperty({ enum: MatchResult })
  result: string;

  @ApiProperty({ type: String })
  gameDateTime: Date;

  @ApiProperty({ type: Number, nullable: true })
  point: number | null;
}

export class SearchMatchesResponse {
  @ApiProperty({
    description: 'Array of matches',
    type: [MatchResponse],
  })
  matches: MatchResponse[];

  @ApiProperty({
    description: 'Total number of matches found',
    example: 100,
    type: Number,
  })
  total: number;
}

export class UpdateMatchBody {
  @ApiProperty({ description: 'Match ID', example: '550e8400-e29b-41d4-a716-446655440000', type: String })
  @IsUUID('4')
  id: string;

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
    type: String,
  })
  @IsEnum(MatchResult)
  result: MatchResult;

  @ApiProperty({
    description: 'Game date and time (ISO8601)',
    example: '2024-11-24T10:30:00Z',
    type: String,
  })
  @IsDateString()
  gameDateTime: string;

  @ApiProperty({
    description: 'Points earned',
    example: 1500,
    required: false,
    type: Number,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  point?: number;
}

export class BulkUpdateMatchesRequest {
  @ApiProperty({
    type: [UpdateMatchBody],
    description: 'Array of matches to update',
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => UpdateMatchBody)
  matches: UpdateMatchBody[];
}

export class BulkUpdateMatchesResponse {
  @ApiProperty({ description: 'Operation success status', example: true, type: Boolean })
  success: boolean;
}

export class BulkDeleteMatchesRequest {
  @ApiProperty({
    type: [String],
    description: 'Array of match IDs to delete',
    example: ['550e8400-e29b-41d4-a716-446655440000'],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  ids: string[];
}

export class BulkDeleteMatchesResponse {
  @ApiProperty({ description: 'Operation success status', example: true, type: Boolean })
  success: boolean;
}

// Domain Layer: Repository/UseCase間で使用する型
export interface CreateMatch {
  userId: string;
  ruleId: number;
  weaponId: number;
  stageId: number;
  battleTypeId: number;
  result: string;
  gameDateTime: Date;
  point: number | null;
}

export interface UpdateMatch {
  ruleId: number;
  weaponId: number;
  stageId: number;
  battleTypeId: number;
  result: string;
  gameDateTime: Date;
  point: number | null;
}
