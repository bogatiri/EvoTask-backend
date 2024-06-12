import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import * as cookieParser from 'cookie-parser'
import * as express from 'express'

async function bootstrap() {
	const app = await NestFactory.create(AppModule)

	app.setGlobalPrefix('api')
	app.use('/static/uploads', express.static('uploads'));
	app.use(cookieParser())
	app.enableCors({
		origin: ['http://localhost:3000', 'http://87.228.9.112:3000', 'https://evotask.ru', 'https://evotask.ru:3000'],
		credentials: true,
		exposedHeaders: 'set-cookie'
	})

	await app.listen(4201)
}
bootstrap()
