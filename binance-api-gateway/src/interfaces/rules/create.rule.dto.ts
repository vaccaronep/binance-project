import { ApiProperty } from '@nestjs/swagger';

export class CreateRuleDto {
  @ApiProperty({
    required: true,
    uniqueItems: true,
    example: 'uuid',
  })
  userId: string;
  @ApiProperty({
    required: true,
    uniqueItems: true,
    example: 'BTCUSDT',
  })
  ticker: string;
  @ApiProperty({
    required: true,
    uniqueItems: true,
    example: '0.07%',
  })
  take_profit: number;
  @ApiProperty({
    required: true,
    uniqueItems: true,
    example: '0.03%',
  })
  stop_loss: number;
  @ApiProperty({
    required: true,
    uniqueItems: true,
    example: 'true',
  })
  is_future: boolean;
}
