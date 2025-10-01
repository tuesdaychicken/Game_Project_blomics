//로그 추가
import { Injectable, Logger } from '@nestjs/common';
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

    // 쿠키에 있으면 닉네임, 없으면 새로 생성
    async registerOrUpdate(id: string | null, nickname: string) {
        //쿠키가 있으면 무슨 값이며 닉네임은 어떻게 되는지
        this.logger.log(`users.service registerOrUpdate 호출, 등록 똔는 수정 id=${id ?? 'null'} nickname=${nickname}`);

        //쿠키가 있는 사용자는 닉네임만 변경
        if (id) {
            const found = await this.findById(id);
            if (found) {
                //쿠키값과 닉네임값 확인 로그
                this.logger.log(`users.service updateNickname 호출, 닉네임 변경 id=${id} -> ${found.nickname} -> ${nickname}`);

                // 쿠키가 있는 기존 사용자: 닉네임만 변경
                found.nickname = nickname;
                return this.repo.save(found);
            }
            // 쿠키가 있는데 DB에 사용자가 없으면(희귀 케이스) 닉네임 기준으로 이어붙이기
            this.logger.warn(`users.service 쿠키는 있지만 DB에 없음 | uid=${id} → 닉네임으로 재연결 시도`);
        }
        // 쿠키가 없으면 닉네임으로 기존 사용자 찾기
        const byNick = await this.findByNickname(nickname);
        if (byNick) {
            //쿠키가 없어? 그럼 이전에 등록했던 유저였는지 확인 ㄱㄱ
            this.logger.log(`users.service 기존 사용자 확인 nickname=${nickname} id=${byNick.id}`);

            // 기존 유저면 그대로 반환(컨트롤러에서 이 id로 쿠키 발급)
            return byNick;
        }

        // 없으면 새로 생성(점수 0으로 시작)
        const created = this.repo.create({ nickname, highScore: 0, lastScore: 0 });

        //로그를 찍어서 어떤 값 넘어가는지
        const saved = await this.repo.save(created);

        this.logger.log(`users.service 신규 사용자임 등록 하겠음 id=${saved.id} nickname=${saved.nickname}`);
        return saved;
    }
}