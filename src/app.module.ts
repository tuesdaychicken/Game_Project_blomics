import { Module } from '@nestjs/common';

// .env(환경변수) 읽기
import { ConfigModule, ConfigService } from '@nestjs/config';

// 정적 폴더 서빙
import { ServeStaticModule } from '@nestjs/serve-static';
import * as path from 'path';

//sqlite typeORM 연결
import { TypeOrmModule } from '@nestjs/typeorm';

// Nest가 기본으로 만든 컨트롤러/서비스
import { AppController } from './app.controller';
import { AppService } from './app.service';

// 유저 모듈과 연결하기
import {UsersModule} from './users/users.module';

// 스코어 모듈과 연결하기
import {ScoresModule} from "./scores/scores.module";

//경로 모듈 연결
import { PagesModule } from './pages/pages.module';

@Module({
    imports: [

        //.env 사용
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: ['.env'],
        }),

        //정적 폴더 서빙? (STATIC_ROOT 환경변수로 폴더 이름을 바꿔도 코드 수정 불필요)
        ServeStaticModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (cfg: ConfigService) => {
                const root = cfg.get<string>('STATIC_ROOT', 'static'); // 기본값: static
                return [
                    {
                        rootPath: path.join(process.cwd(), root), // 실제 디스크 경로
                        serveRoot: '/', // http://localhost:3000/ 로 접근하면 이 폴더를 보여줌
                    },
                ];
            },
        }),

        // 3) TypeORM + SQLite 연결
        TypeOrmModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (cfg: ConfigService) => {

                // 기본 ./db.sqlite
                const dbPath = cfg.get<string>('DATABASE_PATH', './db.sqlite');
                return {
                    type: 'sqlite',
                    database: dbPath,

                    //true 로 하면 추후 Entity를 모듈에 등록만 해도 자동 인식됨
                    autoLoadEntities: true,

                    //엔티티 변경 시 DB 스키마 자동 반영
                    synchronize: true,
                    logging: false,
                };
            },
        }),
        //유저 모듈 연결
        UsersModule,
        ScoresModule,
        PagesModule,
    ],
    // 기본으로 생성된 컨트롤러/서비스를 등록(있어도 되고 없어도 됨)
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}