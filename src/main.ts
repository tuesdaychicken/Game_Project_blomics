import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

//쿠키 추가
import cookieParser from 'cookie-parser';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    const cfg = app.get(ConfigService);
    const port = cfg.get<number>('PORT', 3000);

    // 쿠키 서명용 시크릿 (환경변수에서 읽음)
    const cookieSecret = cfg.get<string>('COOKIE_SECRET', 'dev_secret_change_me');
    app.use(cookieParser(cookieSecret));

    await app.listen(port);

    console.log(`Server running on http://localhost:${port}`);
    console.log(`Static served at http://localhost:${port}/`);
    console.log(`API at http://localhost:${port}/api`);
}
bootstrap();