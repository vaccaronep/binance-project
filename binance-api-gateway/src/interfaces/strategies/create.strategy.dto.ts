import { ApiProperty } from '@nestjs/swagger';

export class CreateStrategyDto {
  @ApiProperty({
    required: true,
    uniqueItems: true,
    example: 'estrategia 1',
  })
  name: string;
  @ApiProperty({
    required: true,
    uniqueItems: true,
    example: 'rsi 14, vol 80, macd 24',
  })
  params: string;
}
