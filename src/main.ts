import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
    const httpsOptions = {
        key: process.env.PRIVKEY,
        cert: process.env.FULLCHAIN,
    };

    const app = await NestFactory.create(AppModule, { httpsOptions });

    app.setGlobalPrefix('api');
    app.use('/static/uploads', express.static('uploads'));
    app.use(cookieParser());
    app.enableCors({
        origin: ['http://localhost:3000', 'https://evotask.ru', 'https://evotask.ru:3000'],
        credentials: true,
        exposedHeaders: 'set-cookie',
    });

    await app.listen(4201);
}
bootstrap();
