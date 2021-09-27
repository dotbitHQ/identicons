import { Controller, Get, Header, Param, Res } from '@nestjs/common'
import { Response } from 'express'
import { AppService } from './app.service'
import { TIME_30D } from './constants/index'

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/identicon/:name')
  @Header('content-type', 'image/png')
  @Header('accept-ranges', 'bytes')
  @Header('Cache-Control', 'public, max-age=' + TIME_30D)
  async identicon(@Res() res, @Param('name') name) {
    const _identiconCanvas = await this.appService.identiconBuffer(
      name.toLocaleLowerCase()
    )
    res.send(_identiconCanvas)
  }

  @Get('/card/:account')
  @Header('content-type', 'image/png')
  @Header('cache-control', 'public, max-age=' + TIME_30D)
  async card(@Res() res: Response, @Param('account') account: string) {
    const cardBuffer = await this.appService.card(account.toLowerCase())

    res.send(cardBuffer)
  }
}
