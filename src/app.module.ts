import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AvatarService } from './avatar.service'
import { Erc721Service } from './erc721/erc721.service'

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, AvatarService, Erc721Service]
})
export class AppModule {}
