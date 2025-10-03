import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';
import { join } from 'path';
import { PAGES_DIR } from './pages.constants';

// 게임 플레이 페이지로
@Controller('play')
export class PlayPageController {
    @Get()
    play(@Res() res: Response) {
        return res.sendFile(join(PAGES_DIR, 'play.html'));
    }
}