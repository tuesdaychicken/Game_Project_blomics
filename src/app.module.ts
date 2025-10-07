import {Module} from '@nestjs/common';
import {ConfigModule, ConfigService} from '@nestjs/config';
import {ServeStaticModule} from '@nestjs/serve-static';
import * as path from 'path';
import {TypeOrmModule} from '@nestjs/typeorm';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {UsersModule} from './users/users.module';
import {ScoresModule} from './scores/scores.module';
import {PagesModule} from './pages/pages.module';
import {RouterModule} from '@nestjs/core';

@Module({
    imports: [

        // .env 사용
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: ['.env'],
        }),

        // 정적 폴더 서빙
        ServeStaticModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (cfg: ConfigService) => {
                const root = cfg.get<string>('STATIC_ROOT', 'static');
                return [
                    {
                        rootPath: path.join(process.cwd(), root),
                        serveRoot: '/',
                        serveStaticOptions: {
                            // 루트로 접속하면 이 파일을 기본 문서로 반환
                            index: 'loading.html',
                        },
                    },
                ];
            },
        }),

        // TypeORM + SQLite 연결
        TypeOrmModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (cfg: ConfigService) => {
                const dbPath = cfg.get<string>('DATABASE_PATH', './db.sqlite');
                return {
                    type: 'sqlite',
                    database: dbPath,
                    autoLoadEntities: true,
                    synchronize: true,
                    logging: false,
                };
            },
        }),

        // 기능 모듈
        UsersModule,
        ScoresModule,
        PagesModule,

        // ScoresModule만 /api 아래로 마운트
        RouterModule.register([
            {
                path: 'api',
                children: [
                    {path: '', module: ScoresModule},
                    {path: '', module: UsersModule},
                ],
            },
        ]),
    ],
    controllers: [],
    providers: [AppService],
})
export class AppModule {
}