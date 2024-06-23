import { Body, Controller, Post } from '@nestjs/common';
import { OrderRoyalMail } from '../model/RoyalMail';
import { RoyalMailService } from '../services/RoyalMailService';

@Controller('royalmail')
export class RoyalMailController {
  constructor(private readonly royalMailService: RoyalMailService) {}

  @Post()
  async getList(@Body() props) {
    return await this.royalMailService.getOrder({});
  }
}
