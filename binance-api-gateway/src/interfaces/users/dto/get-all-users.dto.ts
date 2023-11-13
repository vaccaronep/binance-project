import { ApiProperty } from '@nestjs/swagger';
import { IUser } from '../user.interface';

export class GetUsersResponseDto {
  @ApiProperty({ example: 'users_get_all' })
  message: string;
  @ApiProperty({
    example: {
      users: [
        {
          email: 'test@test.com',
          is_adxtive: true,
        },
      ],
    },
    nullable: true,
  })
  data: {
    users: IUser[];
  };
  @ApiProperty({ example: 'null' })
  errors: { [key: string]: any };
}
