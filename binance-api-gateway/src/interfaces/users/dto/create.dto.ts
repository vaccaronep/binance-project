import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    uniqueItems: true,
    example: 'test1@test1.com',
  })
  email: string;
  @ApiProperty({
    minLength: 6,
    example: 'test11',
  })
  password: string;
  @ApiProperty({
    example: '["btcusdt", "ethusdt"]',
  })
  wishlist: string[];
}
