import {Controller, Post, Get, Body, Req, UsePipes, ValidationPipe, Logger, HttpException, HttpStatus} from '@nestjs/common';
import type {Request} from 'express';
import {ScoresService} from './scores.service';
import {SubmitScoreDto} from './dto/submit-score.dto';

//확장을 하더라도 점수만 관련된 확장이 되도록 설계
@Controller('scores') // 전역 프리픽스 'api'가 있음
export class ScoresController {
    private readonly logger = new Logger(ScoresController.name);

    constructor(private readonly scores: ScoresService) {
    }

    // 점수 저장, 최근 점수계속 바꾸고, 최고 점수는 더 클 때만 업데이트
    @UsePipes(new ValidationPipe({whitelist: true}))
    @Post()
    async submitScore(
        @Body() body: SubmitScoreDto,
        @Req() req: Request,
    ) {
        const uid = req.cookies?.uid;
        this.logger.log(`POST /scores, 점수 저장, uid=${uid ?? '없음'}, body=${JSON.stringify(body)}`);

        //쿠기 없으면 401뜨기에 이렇게
        if (!uid) {
            throw new HttpException('쿠키 없음', HttpStatus.UNAUTHORIZED);
        }

        //서비스가 upset처럼 동작하도록
        const saved = await this.scores.submitScore(uid, body.score);

        //기존 사용자만 허용한다면 404유지
        if (!saved) {
            this.logger.warn(`오류 uid=${uid}`);
            throw new HttpException('사용자 못찾음', HttpStatus.NOT_FOUND);
        }

        this.logger.log(`점수 저장 완료, id=${saved.id}, high=${saved.highScore}. last=${saved.lastScore}`);
        return {
            id: saved.id,
            nickname: saved.nickname,
            highScore: saved.highScore,
            lastScore: saved.lastScore,
        };
    }

    // 점수 조회
    @Get()
    async getScores(@Req() req: Request) {
        const uid = req.cookies?.uid;
        this.logger.log(`GET /scores, 점수 불러오기, uid=${uid ?? '없음'}`);

        //쿠키 없음
        if (!uid) {
            this.logger.warn('쿠키 없음 → 401');
            throw new HttpException('쿠키 없음', HttpStatus.UNAUTHORIZED);
        }

        const data = await this.scores.getScores(uid);

        //사용자 없음
        if (!data) {
            this.logger.warn(`사용자 없음, uid=${uid}`);
            throw new HttpException('사용자 없음', HttpStatus.NOT_FOUND);
        }

        this.logger.log(`점수 조회, high=${data.highScore}, last=${data.lastScore}`);
        return data;
    }
}