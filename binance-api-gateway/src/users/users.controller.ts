import { Body, Controller, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from 'src/interfaces/users/dto/create.dto';

@Controller('users')
@ApiTags('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async createuser(@Body() userRequest: CreateUserDto) {
    return this.usersService.createUser(userRequest);
  }
}
