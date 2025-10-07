import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';
import { join } from 'path';

//해당 경로(static)의 html 파일로 직접 이동하기 위한 경로
const PAGES_DIR = join(process.cwd(), 'static');

// view 전용 컨트롤러
@Controller()
export class PageController {

    //쿠키가 없으면 등록 화면으로
    @Get('join')
    join(@Res() res: Response) {
        return res.sendFile(join(PAGES_DIR, 'join.html'));
    }

    //쿠키가 있고 유저가 있으면 메인 화면으로
    @Get('main')
    game(@Res() res: Response) {
        return res.sendFile(join(PAGES_DIR, 'main.html'));
    }

    //게임하는 화면으로
    @Get('game')
    play(@Res() res: Response) {
        return res.sendFile(join(PAGES_DIR, 'game.html'));
    }

    //점수 보는 화면으로
    @Get('scores')
    scores(@Res() res: Response) {
        return res.sendFile(join(PAGES_DIR, 'scores.html'));
    }
}