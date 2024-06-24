import { Controller, Get } from '@nestjs/common';
import { AwsService } from '../services/AwsService';

@Controller('aws')
export class AwsController {
    constructor(private awservice: AwsService) {}

    @Get()
    async syncOrders() {
        return await this.awservice.syncOrders();
    }
}
