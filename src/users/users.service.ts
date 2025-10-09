//로그 추가
import { Injectable, Logger, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {

    //로그 객체 생성
    private readonly logger = new Logger(UsersService.name);

    constructor(
        @InjectRepository(User) private readonly repo: Repository<User>,
    ) {}

    // 유저 찾기
    async findById(id: string) {
        //해당 메서드에서 뭔 값을 찾으려 하는지 확인
        this.logger.log(`users.service findById 호출, 사용자 찾기 id=${id}`);
        return this.repo.findOne({ where: { id } });
    }

    // 쿠키가 없는데 등록된 유저인지 처음 닉네임 입력 부분에서 있는지 찾는 역할
    async findByNickname(nickname: string) {
        //해당 메서드에서 찾는 닉네임
        this.logger.log(`users.service findByNickname 호출, 닉네임 조회 nickname=${nickname}`);
        return this.repo.findOne({ where: { nickname } });
    }

    // 유저 생성
    async registerOrUpdate(id: string | null, nickname: string) {
        this.logger.log(`users.service registerOrUpdate 호출 | id=${id ?? 'null'} nickname=${nickname}`);

        // 쿠키가 있으면 그대로 사용자 조회해서 반환
        if (id) {
            const found = await this.findById(id);
            this.logger.log(`users.service 기존 사용자 반환 | uid=${id} nickname=${found?.nickname ?? 'null'}`);
            return found;
        }

        // 쿠키가 없으면 신규 등록
        const exists = await this.findByNickname(nickname);
        if (exists) {
            this.logger.log(`users.service 닉네임 중복 | nickname=${nickname} id=${exists.id}`);
            throw new ConflictException('이미 사용 중인 닉네임입니다.');
        }

        // 쿠키와 닉네임 중복 여부 확인 후 사용자 생성
        const created = this.repo.create({ nickname, highScore: 0, lastScore: 0 });
        const saved = await this.repo.save(created);
        this.logger.log(`users.service 신규 사용자 생성 | id=${saved.id} nickname=${saved.nickname}`);
        return saved;
    }
}