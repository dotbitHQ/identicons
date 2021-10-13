import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AvatarService } from './avatar.service'

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, AvatarService]
})
export class AppModule {}
