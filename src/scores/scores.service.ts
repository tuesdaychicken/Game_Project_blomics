import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';

@Injectable()
export class ScoresService {
    private readonly logger = new Logger(ScoresService.name);

    constructor(@InjectRepository(User) private readonly usersRepo: Repository<User>) {}

    // 점수 저장: lastScore는 항상 갱신, highScore는 더 클 때만 갱신
    async submitScore(userId: string, score: number) {
        this.logger.log(`scores.service submitScore 호출, userId=${userId}, score=${score}`);
        const user = await this.usersRepo.findOne({ where: { id: userId } });
        if (!user) {
            this.logger.warn(`점수 저장 실패 or 사용자 없음, userId=${userId}`);
            return null;
        }
        
        //기록기록기록
        user.lastScore = score;
        
        if (score > user.highScore) {
            this.logger.log(`최고 점수 변경O, 이전=${user.highScore}, 변경 후=${score}`);
            user.highScore = score;
        } else {
            this.logger.log(`최고 점수 변경X, 이전=${user.highScore}, 변경 후=${score}`);
        }
        const saved = await this.usersRepo.save(user);
        this.logger.log(`score 저장 완료, userId=${saved.id}, high=${saved.highScore}, last=${saved.lastScore}`);
        return saved;
    }

    // 현재 점수 조회
    async getScores(userId: string) {
        const user = await this.usersRepo.findOne({ where: { id: userId } });
        if (!user) return null;
        return { highScore: user.highScore, lastScore: user.lastScore };
    }
}