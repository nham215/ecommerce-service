import { Body, Controller, Get, Post } from '@nestjs/common';
import { OdooService } from '../services/OdooService';
import { Odoo } from '../model/Odoo';

@Controller('odoo')
export class OdooController {
  constructor(private odooService: OdooService) {}

  @Post()
  async syncSale(@Body() odooData: Odoo) {
    try {
      const orderId = await this.odooService.syncSale(odooData);
      return { success: true, orderId: orderId };
    } catch (error) {
      console.error('Error syncing sale:', error);
      return { success: false, error: 'Failed to sync sale' };
    }
  }
}
