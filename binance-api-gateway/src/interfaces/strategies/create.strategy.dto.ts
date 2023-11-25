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
    example: '1',
  })
  tv_id: number;
}
