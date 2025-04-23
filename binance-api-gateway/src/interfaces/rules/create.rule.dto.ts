import { ApiProperty } from '@nestjs/swagger';

enum actionTypes {
  'TAKE_PROFIT' = 'TAKE_PROFIT',
  'STOP_LOSS' = 'STOP_LOSS',
}

enum ruleType {
  'OCO' = 'OCO',
  'TRAILING' = 'TRAILING',
}

enum ruleSide {
  'BUY' = 'BUY',
  'SELL' = 'SELL',
}
class ActionDto {
  @ApiProperty({
    required: true,
    enum: actionTypes,
    example: Object.keys(actionTypes),
  })
  type: string;
  @ApiProperty({
    required: true,
    example: '0.03',
  })
  percentage: string;
}

export class CreateRuleDto {
  @ApiProperty({
    required: true,
    uniqueItems: true,
    example: 'BTCUSDT',
  })
  ticker: string;
  @ApiProperty({
    required: true,
    uniqueItems: true,
    example: 'rsi 14, vol 80, macd 24',
  })
  params: string;
  @ApiProperty({
    required: true,
    enum: ruleType,
    example: Object.keys(ruleType),
  })
  type: string;
  @ApiProperty({
    required: true,
    enum: ruleType,
    example: Object.keys(ruleSide),
  })
  side: string;
  @ApiProperty({
    required: true,
    uniqueItems: true,
    example: 'true',
  })
  is_future: boolean;
  @ApiProperty({
    required: true,
    example: '1',
  })
  pyramiding: number;
  @ApiProperty({
    required: true,
    example: '1',
  })
  quantity_trade: number;
  @ApiProperty({
    required: true,
  })
  actions: ActionDto[];
}
