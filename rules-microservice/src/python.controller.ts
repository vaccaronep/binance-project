import { MessagePattern } from '@nestjs/microservices';
import { PythonAnyWhereHttp } from './services/pythonaw.http.service';
import { Controller } from '@nestjs/common';

@Controller('python')
export class PythonController {
  constructor(private readonly pythonService: PythonAnyWhereHttp) {}

  @MessagePattern({ cmd: 'python_get_config' })
  async getConfig() {
    return this.pythonService.getConfigurations();
  }

  @MessagePattern({ cmd: 'python_update_config' })
  async updateConfig(data: {
    ticker: string;
    strategyId: number;
    is_futures: boolean;
    pyramiding: number;
    qty: number;
    actual_trade: number;
    side: string;
  }) {
    return this.pythonService.updateConfiguration(data);
  }
}
