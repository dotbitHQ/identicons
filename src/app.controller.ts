import { Controller, Get, Header, Headers, Param, Query, Res } from '@nestjs/common'
import { Response } from 'express'
import { AppService } from './app.service'
import { AvatarOptions, AvatarService } from './avatar.service'
import { TIME_1H, TIME_30D } from './constants/index'

@Controller()
export class AppController {
  constructor (
    private readonly appService: AppService,
    private readonly avatarService: AvatarService,
  ) {}

  @Get('/identicon/:name')
  @Header('content-type', 'image/png')
  @Header('accept-ranges', 'bytes')
  @Header('Cache-Control', `public, max-age=${TIME_30D}`)
  async identicon (@Res() res, @Param('name') name): Promise<void> {
    const _identiconCanvas = await this.appService.identiconBuffer(
      name.toLocaleLowerCase()
    )
    res.send(_identiconCanvas)
  }

  @Get('/seo/:name')
  @Header('content-type', 'image/png')
  @Header('accept-ranges', 'bytes')
  @Header('Cache-Control', `public, max-age=${TIME_30D}`)
  async seo (@Res() res, @Param('name') name): Promise<void> {
    const seo = await this.appService.seo(
      name.toLowerCase()
    )
    res.send(seo)
  }

  @Get('/bestdas/seo/:name')
  @Header('content-type', 'image/png')
  @Header('accept-ranges', 'bytes')
  @Header('Cache-Control', `public, max-age=${TIME_30D}`)
  async bestdasSeo (@Res() res, @Param('name') name): Promise<void> {
    const seo = await this.appService.seo(
      name.toLowerCase(),
      true
    )
    res.send(seo)
  }

  @Get('/avatar/:account')
  @Header('content-type', 'image/png')
  @Header('accept-ranges', 'bytes')
  @Header('Cache-Control', `public, max-age=${TIME_30D}`)
  async avatar (@Res() res, @Param('account') account: string, @Query() query: AvatarOptions): Promise<void> {
    const avatar = await this.avatarService.avatar(account.toLowerCase(), query)

    res.send(avatar)
  }

  @Get('/resolve/:account')
  @Header('Cache-Control', `public, max-age=${TIME_1H}`)
  async resolve (@Param('account') account: string) {
    return await this.avatarService.resolve(account)
  }

  @Get('/card/bestdas/:account')
  @Header('content-type', 'image/png')
  @Header('cache-control', `public, max-age=${TIME_30D}`)
  async bestDasCard (@Res() res: Response, @Param('account') account: string): Promise<void> {
    const cardBuffer = await this.appService.bestDasCard(account.toLowerCase())

    res.send(cardBuffer)
  }

  @Get('/card/bitcc/:account')
  @Header('content-type', 'image/png')
  @Header('cache-control', `public, max-age=${TIME_30D}`)
  async bitccCard (@Res() res: Response, @Param('account') account: string, @Headers('referer') referer: string): Promise<void> {
    const cardBuffer = await this.appService.bitccCard(
      account.toLowerCase(),
      referer
    )

    res.send(cardBuffer)
  }
}
