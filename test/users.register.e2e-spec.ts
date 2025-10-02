import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';

function toCookieHeader(setCookie: string | string[] | undefined): string {
    if (!setCookie) return '';
    const arr = Array.isArray(setCookie) ? setCookie : [setCookie];
    const pairs = arr.map((c) => c.split(';')[0]);
    return pairs.join('; ');
}

describe('Users - Register & Me (e2e)', () => {

    let app: INestApplication;

    async function bootstrap() {

        // Given: 테스트 전용 환경 구성
        process.env.DATABASE_PATH = ':memory:';
        process.env.COOKIE_SECRET = 'test_secret';
        
        const m: TestingModule = await Test.createTestingModule({ imports: [AppModule] }).compile();
        app = m.createNestApplication();

        // 경로 꼭 까먹지 말고 여기 자꾸 실수해 너
        app.setGlobalPrefix('api');

        app.use(cookieParser(process.env.COOKIE_SECRET));
        await app.init();
    }
    
    beforeEach(async () => { await bootstrap(); });
    afterEach(async () => { await app.close(); });

    it('POST /api/register - 쿠키 발급 & 사용자 생성', async () => {
        //Given: 닉네임이 주어짐
        const nickname = '독기';

        //When: /api/register 호출하여 신규 사용자 등록
        const res = await request(app.getHttpServer())
            .post('/api/register')
            .send({ nickname })
            .expect(201);

        //Then: Set-Cookie로 uid가 발급되었는지 확인
        const cookieHeader = toCookieHeader(res.headers['set-cookie']);
        expect(cookieHeader).toContain('uid=');

        expect(res.body).toMatchObject({
            id: expect.any(String),
            nickname,
            highScore: 0,
            lastScore: 0,
        });
    });

    it('GET /api/me - 쿠키로 현재 사용자 조회', async () => {
        //Given: 먼저 register로 uid 쿠키 확보
        const register = await request(app.getHttpServer())
            .post('/api/register')
            .send({ nickname: '블로믹스' })
            .expect(201);

        // 응답의 Set-Cookie를 다음 요청의 Cookie 헤더로 사용할 수 있게 정규화
        const cookieHeader = toCookieHeader(register.headers['set-cookie']);

        //When: /api/me 호출(쿠키 포함)
        const me = await request(app.getHttpServer())
            .get('/api/me')
            .set('Cookie', cookieHeader)
            .expect(200);

        //Then: 존재 플래그와 함께 사용자 프로필 기본값 확인
        expect(me.body).toMatchObject({
            exists: true,
            id: expect.any(String),
            nickname: '블로믹스',
            highScore: 0,
            lastScore: 0,
        });
    });
});