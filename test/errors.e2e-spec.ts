import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';

describe('Errors - Without Cookie (e2e)', () => {
    let app: INestApplication;

    async function bootstrap() {
        // Given: 테스트 전용 환경 구성
        process.env.DATABASE_PATH = ':memory:';
        process.env.COOKIE_SECRET = 'test_secret';

        const m: TestingModule = await Test.createTestingModule({ imports: [AppModule] }).compile();
        app = m.createNestApplication();

        app.setGlobalPrefix('api');
        app.use(cookieParser(process.env.COOKIE_SECRET));

        await app.init();
    }

    beforeEach(async () => { await bootstrap(); });
    afterEach(async () => { await app.close(); });

    it('GET /api/me - 쿠키 없으면 exists=false', async () => {
        // Given-When: 인증 쿠키 없이 /api/me 호출
        const r = await request(app.getHttpServer()).get('/api/me').expect(200);
        // Then: 서버는 "현재 사용자 없음" 의미로 exists=false를 반환해야 함
        // - 설계 의도: /me는 인증 실패로 에러를 던지기보다 "부재"를 알려줌
        expect(r.body).toEqual({ exists: false });
    });

    it('GET /api/scores - 쿠키 없으면 401', async () => {
        // Given-When-Then: 인증 쿠키 없이 보호된 리소스에 접근 → 401
        //   - 설계 의도: 점수 조회는 사용자 맥락(쿠키 uid)이 필수이므로 인증 실패 시 401
        await request(app.getHttpServer()).get('/api/scores').expect(401);
    });

    it('POST /api/scores - 쿠키 없으면 401', async () => {
        // Given-When-Then: 인증 쿠키 없이 점수 저장 시도 → 401
        // - 설계 의도: 누구의 점수인지 식별할 수 없어 저장 불가 → 401 Unauthorized
        await request(app.getHttpServer()).post('/api/scores').send({ score: 5 }).expect(401);
    });
});