import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from '../users.service';
import { User } from '../user.entity';

//쿠키 테스트를 위해 추가
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

describe('UsersService (integration)', () => {
    let moduleRef: TestingModule;
    let service: UsersService;

    let repo: Repository<User>;

    beforeAll(async () => {
        moduleRef = await Test.createTestingModule({
            imports: [
                // 테스트용 SQLite
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
            providers: [UsersService],
        }).compile();

        service = moduleRef.get<UsersService>(UsersService);
        repo = moduleRef.get<Repository<User>>(getRepositoryToken(User));
    });

    afterAll(async () => {
        await moduleRef.close();
    });

    it('신규 유저 생성', async () => {
        const saved = await service.registerOrUpdate(null, '나다');
        expect(saved).toBeDefined();
        expect(saved.id).toBeDefined();
        expect(saved.nickname).toBe('나다');
        expect(saved.highScore).toBe(0);
        expect(saved.lastScore).toBe(0);
    });

    it('신규 유저 생성 테스트 후 같이 돌려서 찾는 테스트', async () => {
        const again = await service.registerOrUpdate(null, '나다');
        expect(again).toBeDefined();
        const byNick = await service.findByNickname('나다');
        expect(byNick?.id).toBe(again.id);
    });

    //다른 값 넣으면 안되는거 확인함 
    it('닉네임으로 조회 가능해야함', async () => {
        const byNick = await service.findByNickname('나다');
        expect(byNick).toBeDefined();
        expect(byNick?.nickname).toBe('나다');
    });

    it('쿠키 없이 같은 닉네임 재등록 시 기존 유저 돼야함', async () => {
        // 먼저 같은 닉네임으로 신규 생성
        const first = await service.registerOrUpdate(null, '나다');

        // 쿠키(id) 없이 같은 닉네임으로 다시 등록 → 새로 만들지 않고 기존 유저에 붙어야 함
        const again = await service.registerOrUpdate(null, '나다');

        // 같은 사용자인지 확인 (id 동일해야 함)
        expect(again.id).toBe(first.id);

        // 닉네임 조회로도 같은 사용자 반환되는지 확인
        const byNick = await service.findByNickname('나다');
        expect(byNick?.id).toBe(first.id);
    });


    it('쿠키값으로 기존 사용자 조회 가능해야 함', async () => {
        const cookie = 'cookie';

        await repo.insert({
            id: cookie,
            nickname: '나다',
            highScore: 0,
            lastScore: 0,
        });

        // 쿠키값만으로조회
        const fetched = await service.findById(cookie);

        expect(fetched).toBeDefined();
        expect(fetched!.id).toBe(cookie);
        expect(fetched!.nickname).toBe('나다');
    });

});