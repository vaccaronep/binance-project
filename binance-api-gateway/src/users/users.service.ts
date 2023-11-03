import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { CreateUserDto } from 'src/interfaces/users/dto/create.dto';

@Injectable()
export class UsersService {
  constructor(
    @Inject('USERS_SERVICE') private readonly usersMicroService: ClientProxy,
  ) {}

  async createUser(userRequest: CreateUserDto) {
    const userMicroserviceResponse: any = await firstValueFrom(
      this.usersMicroService.send({ cmd: 'user_create' }, userRequest),
    );
    return {
      response: userMicroserviceResponse,
    };
  }
}
