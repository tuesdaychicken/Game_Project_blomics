import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScoresService } from './scores.service';
import { User } from '../users/user.entity';

describe('ScoresService (integration)', () => {
    let moduleRef: TestingModule;
    let service: ScoresService;
    let repo: Repository<User>;

    beforeAll(async () => {
        moduleRef = await Test.createTestingModule({
            imports: [
                // 테스트용 db
                TypeOrmModule.forRoot({
                    type: 'sqlite',
                    database: ':memory:',
                    entities: [User],
                    synchronize: true,
                    dropSchema: true,
                    logging: false,
                }),
                TypeOrmModule.forFeature([User]),
            ],
            providers: [ScoresService],
        }).compile();

        service = moduleRef.get(ScoresService);
        repo = moduleRef.get<Repository<User>>(getRepositoryToken(User));
    });

    afterAll(async () => {
        await moduleRef.close();
    });

    // 테스트 하나 끝나면 비워주기
    beforeEach(async () => {
        await repo.clear();
    });

    // 테스트용 랜덤유저 하나 생성 36연타로 생성
    const makeUser = async (nickname = `유저${Math.random().toString(36).slice(2)}`) => {
        return await repo.save({ nickname, highScore: 0, lastScore: 0 });
    };

    it('점수 저장: lastScore는 항상 갱신, highScore는 더 클 때만 갱신', async () => {
        const u = await makeUser('규성');

        const s1 = await service.submitScore(u.id, 5);
        expect(s1).toBeTruthy();

        //들어간 값이 5점이 맞는지
        expect(s1!.highScore).toBe(5);
        expect(s1!.lastScore).toBe(5);

        //들어간 값이 최고점수는 그대로 5점이어야 하고 최근점수는 3점이어야함
        const s2 = await service.submitScore(u.id, 3);
        expect(s2!.highScore).toBe(5);
        expect(s2!.lastScore).toBe(3);

        //기존 값 5점보다 높은 점수가 들어갔을 때 값이 바뀌는지
        const s3 = await service.submitScore(u.id, 10);
        expect(s3!.highScore).toBe(10); 
        expect(s3!.lastScore).toBe(10);
    });

    it('점수 조회: getScores가 high/last를 반환한다', async () => {
        const u = await makeUser('나다');

        await service.submitScore(u.id, 7);
        let scores = await service.getScores(u.id);
        expect(scores).toEqual({ highScore: 7, lastScore: 7 });

        await service.submitScore(u.id, 2);
        scores = await service.getScores(u.id);
        expect(scores).toEqual({ highScore: 7, lastScore: 2 });
    });

    it('없을때 null 나오는지', async () => {
        const a = await service.submitScore('no-such-id', 5);
        const b = await service.getScores('no-such-id');
        expect(a).toBeNull();
        expect(b).toBeNull();
    });
});