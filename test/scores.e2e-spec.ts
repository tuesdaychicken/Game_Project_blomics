import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';

describe('Scores - Save & Get (e2e)', () => {

    let app: INestApplication;

    //자동으로 쿠키 전달 및 유지 agent, returntype
    let agent: ReturnType<typeof request.agent>;

    async function bootstrap() {

        // 인메모리 SQLite 등으로 가정
        process.env.DATABASE_PATH = ':memory:';

        // 서명 쿠키 검증용 시크릿 (테스트용)
        process.env.COOKIE_SECRET = 'test_secret';

        const m: TestingModule = await Test.createTestingModule({ imports: [AppModule] }).compile();
        app = m.createNestApplication();

        //내 경로
        app.setGlobalPrefix('api');
        // 서버에서 signed cookie를 쓰는 경우?
        app.use(cookieParser(process.env.COOKIE_SECRET));

        // Nest 앱 초기화
        await app.init();

        //쿠키 헤더 첨부
        agent = request.agent(app.getHttpServer());

        // Given: 쿠키가 발급된 닉네임 등록, uid 쿠키 agent 저장
        await agent.post('/api/register').send({ nickname: '게이머' }).expect(201);
    }

    beforeEach(async () => { await bootstrap(); });
    afterEach(async () => { await app.close(); });

    it('POST /api/scores - 첫 저장: last=score, high=score', async () => {

        // When: 점수 7 저장
        const r1 = await agent
            .post('/api/scores')
            .send({ score: 7 })
            .expect(201);

        // Then: highScore와 lastScore 모두 7이어야 함
        expect(r1.body).toEqual({ highScore: 7, lastScore: 7 });

        // And When: 더 낮은 점수 2 저장
        const r2 = await agent
            .post('/api/scores')
            .send({ score: 2 })
            .expect(201);

        // Then: lastScore는 2로 갱신, highScore는 7 그대로, 마지막 점수는 항상 갱신, 최고 점수는 클 때만 검증
        expect(r2.body).toEqual({ highScore: 7, lastScore: 2 });
    });

    it('GET /api/scores - 조회: high/last 확인', async () => {
        // Given: 3 → 10 순으로 점수를 저장
        //   - highScore 최댓값은 10
        //   - lastScore 최신값도 10
        await agent.post('/api/scores').send({ score: 3 }).expect(201);
        await agent.post('/api/scores').send({ score: 10 }).expect(201);

        // When: 현재 점수 상태 조회
        const r = await agent.get('/api/scores').expect(200);

        // Then: highScore=10(최대치), lastScore=10(가장 최근 저장)
        expect(r.body).toEqual({ highScore: 10, lastScore: 10 });
    });
});