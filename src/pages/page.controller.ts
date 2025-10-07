import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';
import { join } from 'path';

const PAGES_DIR = join(process.cwd(), 'static');

// 게임 시작 화면으로
@Controller()
export class PageController {

    @Get('join')
    join(@Res() res: Response) {
        return res.sendFile(join(PAGES_DIR, 'join.html'));
    }

    @Get('main')
    game(@Res() res: Response) {
        return res.sendFile(join(PAGES_DIR, 'main.html'));
    }

    @Get('play')
    play(@Res() res: Response) {
        return res.sendFile(join(PAGES_DIR, 'play.html'));
    }

    @Get('scores')
    scores(@Res() res: Response) {
        return res.sendFile(join(PAGES_DIR, 'scores.html'));
    }
}