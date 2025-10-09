import { Controller, Post, Get, Body, Req, Res, UsePipes, ValidationPipe, Logger } from '@nestjs/common';
import type { Request, Response } from 'express';
import { UsersService } from './users.service';
import { RegisterUserDto } from './dto/register-user.dto';
import {join} from "path";

@Controller('users')
export class UsersController {

    //로그 생성
    private readonly logger = new Logger(UsersController.name);
    
    constructor(private readonly users: UsersService) {}

    // 닉네임 등록/수정
    @UsePipes(new ValidationPipe({ whitelist: true })) // DTO 유효성 검사
    @Post()
    async register(
        @Body() body: RegisterUserDto,
        @Req() req: Request,
        @Res() res: Response,
    ) {

        // 들어온 값하고 쿠키 로그
        this.logger.log(`users.controller POST /users 등록요청 body=${JSON.stringify(body)} cookies=${JSON.stringify(req.cookies || {})}`);

        // 쿠키가 있는지 없는지 확인 후 값을 넘김
        const currentUid = req.cookies?.uid ?? null;

        // 새유저 생성 (또는 기존 사용자 반환)
        const saved = await this.users.registerOrUpdate(currentUid, body.nickname);

        // 서비스가 null을 반환시 등록 실패
        if (!saved) {
            this.logger.warn(`users.controller 등록 실패 | uid=${currentUid ?? 'null'} nickname=${body?.nickname ?? ''}`);
            return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
        }

        //결과 로그 (점수는 기본 값이기에 일단 뺌 필요하면 다시 넣기)
        this.logger.log(`users.controller 등록완료 점수 기본 값은 0 -> id=${saved.id}, nickname=${saved.nickname}, hadCookie=${!!currentUid}`);

        // uid 쿠키가 없던 사용자였다면 새로 발급
        if (!currentUid) {
            // httpOnly: JS에서 접근 불가(보안), sameSite: 기본 보안
            res.cookie('uid', saved.id, { httpOnly: true, sameSite: 'lax' });

            // 쿠키값 로그 출력
            this.logger.log(`쿠키값 생성함`);
        }

        return res.json({
            id: saved.id,
            nickname: saved.nickname,
            highScore: saved.highScore,
            lastScore: saved.lastScore,
        });
    }

    // 현재 로그인(=쿠키 보유) 유저 조회
    @Get()
    async me(@Req() req: Request, @Res() res: Response) {
        const uid = req.cookies?.uid;

        // Get 호출과 그에 따른 쿠키 로그
        this.logger.log(`users.controller GET /users 조회해봄 uidCookie=${uid ?? '없음'}`);

        if (!uid) {
            // 쿠키 없다
            this.logger.log('쿠키 없음');
            return res.json({ exists: false });
        }

        const user = await this.users.findById(uid);
        if (!user) {
            //쿠키는 있는데 유저가 없다
            this.logger.warn(`users.controller DB에 사용자 없음 근데 쿠키는 있음`);
            return res.json({ exists: false });
        }

        // 겟 하기 전 마지막 값 확인
        this.logger.log(`users.controller 조회 해봤는데 있음! -> id=${user.id}, nickname=${user.nickname}, high=${user.highScore}, last=${user.lastScore}`);
        return res.json({
            exists: true,
            id: user.id,
            nickname: user.nickname,
            highScore: user.highScore,
            lastScore: user.lastScore,
        });
    }
}
