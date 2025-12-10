import {
  IsInt,
  IsDateString,
  IsArray,
  IsOptional,
  IsEnum,
  ArrayMinSize,
  Min,
  Max,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

// グルーピング対象の列挙型
export enum GroupByField {
  RULE = 'rule',
  STAGE = 'stage',
  WEAPON = 'weapon',
  BATTLE_TYPE = 'battleType',
}

// 勝率ソート対象の列挙型
export enum VictoryRateSortBy {
  VICTORY_RATE = 'victoryRate',
  TOTAL_COUNT = 'totalCount',
  WIN_COUNT = 'winCount',
  RULE_NAME = 'ruleName',
  STAGE_NAME = 'stageName',
  WEAPON_NAME = 'weaponName',
  BATTLE_TYPE_NAME = 'battleTypeName',
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

// 勝率API リクエスト
export class GetVictoryRateRequest {
  @ApiProperty({
    description: 'Fields to group by',
    enum: GroupByField,
    isArray: true,
    example: ['rule', 'stage'],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsEnum(GroupByField, { each: true })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return [value];
    }
    return value;
  })
  groupBy: GroupByField[];

  @ApiProperty({
    description: 'Field to sort by',
    enum: VictoryRateSortBy,
    required: false,
    example: VictoryRateSortBy.VICTORY_RATE,
    type: String,
  })
  @IsOptional()
  @IsEnum(VictoryRateSortBy)
  sortBy?: VictoryRateSortBy;

  @ApiProperty({
    description: 'Sort order (asc or desc)',
    enum: SortOrder,
    required: false,
    example: SortOrder.DESC,
    type: String,
  })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder;

  @ApiProperty({
    description: 'Page number (1-based)',
    required: false,
    example: 1,
    type: Number,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Transform(({ value }) => (value ? parseInt(value, 10) : undefined))
  page?: number;

  @ApiProperty({
    description: 'Number of items per page',
    required: false,
    example: 20,
    type: Number,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Transform(({ value }) => (value ? parseInt(value, 10) : undefined))
  pageSize?: number;
}

// 勝率API レスポンス内の個別データ
export class VictoryRateItem {
  @ApiProperty({ type: String, required: false })
  ruleName?: string;

  @ApiProperty({ type: String, required: false })
  stageName?: string;

  @ApiProperty({ type: String, required: false })
  weaponName?: string;

  @ApiProperty({ type: String, required: false })
  battleTypeName?: string;

  @ApiProperty({ type: Number, description: 'Total match count' })
  totalCount: number;

  @ApiProperty({ type: Number, description: 'Win count' })
  winCount: number;

  @ApiProperty({ type: Number, description: 'Victory rate (0-1)' })
  victoryRate: number;
}

// 勝率API レスポンス
export class GetVictoryRateResponse {
  @ApiProperty({ type: [VictoryRateItem] })
  victoryRates: VictoryRateItem[];

  @ApiProperty({
    description: 'Total number of items',
    example: 100,
    type: Number,
  })
  total: number;
}

// ポイント推移API リクエスト
export class GetPointTransitionRequest {
  @ApiProperty({
    description: 'Rule ID to filter by',
    example: 1,
    type: Number,
  })
  @IsInt()
  @Transform(({ value }) => parseInt(value, 10))
  ruleId: number;

  @ApiProperty({
    description: 'Battle Type ID to filter by',
    example: 1,
    type: Number,
  })
  @IsInt()
  @Transform(({ value }) => parseInt(value, 10))
  battleTypeId: number;

  @ApiProperty({
    description: 'Start date (ISO8601)',
    required: false,
    type: String,
    example: '2024-11-01T00:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    description: 'End date (ISO8601)',
    required: false,
    type: String,
    example: '2024-11-30T23:59:59Z',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

// ポイント推移API レスポンス内の個別データ
export class PointTransitionItem {
  @ApiProperty({ type: String, description: 'Game date time (ISO8601)' })
  gameDateTime: string;

  @ApiProperty({ type: Number, description: 'Point value' })
  point: number;
}

// ポイント推移API レスポンス
export class GetPointTransitionResponse {
  @ApiProperty({ type: [PointTransitionItem] })
  points: PointTransitionItem[];
}

// UseCase層で使用する型
export interface VictoryRateResult {
  ruleName?: string;
  stageName?: string;
  weaponName?: string;
  battleTypeName?: string;
  totalCount: number;
  winCount: number;
  victoryRate: number;
}

export interface PointTransitionResult {
  gameDateTime: Date;
  point: number;
}
