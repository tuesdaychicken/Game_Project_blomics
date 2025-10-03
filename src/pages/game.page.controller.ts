import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';
import { join } from 'path';
import { PAGES_DIR } from './pages.constants';

// 게임 시작 화면으로
@Controller('game')
export class GamePageController {
    @Get()
    game(@Res() res: Response) {
        return res.sendFile(join(PAGES_DIR, 'game.html'));
    }
}