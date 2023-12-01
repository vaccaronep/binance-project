import { MessagePattern } from '@nestjs/microservices';
import { PythonAnyWhereHttp } from './services/pythonaw.http.service';
import { Controller } from '@nestjs/common';

@Controller('python')
export class PythonController {
  constructor(private readonly pythonService: PythonAnyWhereHttp) {}

  @MessagePattern({ cmd: 'pyton_get_config' })
  async getConfig() {
    return this.pythonService.getConfigurations();
  }
}
