import { Controller, Get, Head, Header, Headers, Param, Query, Res } from '@nestjs/common'
import { Response } from 'express'
import { AppService } from './app.service'
import { AvatarOptions, AvatarService } from './avatar.service'
import { TIME_10S, TIME_1H, TIME_30D } from './constants/index'
import { Erc721Service } from './erc721/erc721.service'

@Controller()
export class AppController {
  constructor (
    private readonly appService: AppService,
    private readonly avatarService: AvatarService,
    private readonly erc721Service: Erc721Service,
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

  @Get([
    '/resolve/:account',  // todo: remove this legacy endpoint one day
    '/avatar/resolve/:account',
  ])
  @Header('Cache-Control', `public, max-age=${TIME_1H}`)
  async resolve (@Param('account') account: string) {
    return await this.avatarService.resolve(account)
  }

  @Get([
    '/avatar/:account', // todo: remove this legacy endpoint one day
    '/avatar/image/:account',
  ])
  @Header('content-type', 'image/png')
  @Header('accept-ranges', 'bytes')
  @Header('Cache-Control', `public, max-age=${TIME_30D}`)
  async avatar (@Res() res, @Param('account') account: string, @Query() query: AvatarOptions): Promise<void> {
    const avatar = await this.avatarService.avatar(account.toLowerCase(), query)

    res.send(avatar)
  }

  @Get('/erc721/card/test')
  async test () {
    return this.erc721Service.test()
  }

  @Get('/erc721/data/:tokenId')
  @Header('Cache-Control', `public, max-age=${TIME_10S}`)
  // @Header('Cache-Control', `public, max-age=${TIME_1D}`)
  async erc721Metadata (@Param('tokenId') tokenId: string) {
    const res = await this.erc721Service.erc721Metadata(tokenId)
    return res
  }

  @Get('/erc721/card/:tokenId')
  @Header('content-type', 'image/svg+xml')
  @Header('Cache-Control', `public, max-age=${TIME_10S}`)
  // @Header('cache-control', `public, max-age=${TIME_30D}`)
  async erc721Card (@Res() res: Response, @Param('tokenId') tokenId: string): Promise<void> {
    const cardBuffer = await this.erc721Service.erc721Card(tokenId.toLowerCase())

    res.send(cardBuffer)
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
