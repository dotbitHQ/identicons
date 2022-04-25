import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import config from '../config'

async function bootstrap (): Promise<void> {
  const app = await NestFactory.create(AppModule)

  app.enableCors()

  await app.listen(config.port)

  console.log(`app is running on port ${config.port}`, `http://127.0.0.1:${config.port}`)
}

void bootstrap()
