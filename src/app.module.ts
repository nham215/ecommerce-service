import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RoyalMailController } from './modules/syncData/controllers/RoyalMailController';
import { RoyalMailService } from './modules/syncData/services/RoyalMailService';
import { OdooController } from './modules/syncData/controllers/OdooController';
import { OdooService } from './modules/syncData/services/OdooService';
import { AwsController } from './modules/syncData/controllers/AwsController';
import { AwsService } from './modules/syncData/services/AwsService';

@Module({
  imports: [],
  controllers: [RoyalMailController, OdooController, AwsController],
  providers: [RoyalMailService, OdooService, AwsService],
})
export class AppModule {}
