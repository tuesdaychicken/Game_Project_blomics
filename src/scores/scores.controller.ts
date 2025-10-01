import { Controller, Post, Get, Body, Req, Res, UsePipes, ValidationPipe, Logger } from '@nestjs/common';
import type { Request, Response } from 'express';
import { ScoresService } from './scores.service';
import { SubmitScoreDto } from './dto/submit-score.dto';

@Controller() // 전역 프리픽스 'api'가 있으므로 /api/score, /api/scores 가 됨
export class ScoresController {
    private readonly logger = new Logger(ScoresController.name);

    constructor(private readonly scores: ScoresService) {}

    // 점수 저장, 최근 점수계속 바꾸고, 최고 점수는 더 클 때만 업데이트
    @UsePipes(new ValidationPipe({ whitelist: true }))
    @Post('score')
    async submitScore(
        @Body() body: SubmitScoreDto,
        @Req() req: Request,
        @Res() res: Response,
    ) {
        const uid = req.cookies?.uid;
        this.logger.log(`score POST 요청, 점수 저장, uid=${uid ?? '없음'}, body=${JSON.stringify(body)}`);

        //이거 필요한가?
        if (!uid) {
            return res.status(401).json({ message: '쿠키가 없습니다.' });
        }

        const saved = await this.scores.submitScore(uid, body.score);

        //이것도 필요한가?
        if (!saved) {
            this.logger.warn(`오류 uid=${uid}`);
            return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
        }

        this.logger.log(`점수 저장 완료, id=${saved.id}, high=${saved.highScore}. last=${saved.lastScore}`);
        return res.json({
            id: saved.id,
            nickname: saved.nickname,
            highScore: saved.highScore,
            lastScore: saved.lastScore,
        });
    }

    // 점수 조회
    @Get('scores')
    async getScores(@Req() req: Request, @Res() res: Response) {
        const uid = req.cookies?.uid;
        this.logger.log(`scores GET 요청, 점수 조회, uid=${uid ?? '없음'}`);

        //이것도 필요한가?
        if (!uid) {
            this.logger.warn('쿠키 없음 → 401');
            return res.status(401).json({ message: '쿠키가 없습니다.' });
        }

        const data = await this.scores.getScores(uid);

        //이것도 필요한가
        if (!data) {
            this.logger.warn(`사용자 없음, uid=${uid}`);
            return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
        }

        this.logger.log(`점수 조회, high=${data.highScore}, last=${data.lastScore}`);
        return res.json(data);
    }
}