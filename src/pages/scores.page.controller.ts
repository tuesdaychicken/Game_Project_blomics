import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';
import { join } from 'path';
import { PAGES_DIR } from './pages.constants';

// 점수 확인 페이지
@Controller('scores')
export class ScoresPageController {
    @Get()
    scores(@Res() res: Response) {
        return res.sendFile(join(PAGES_DIR, 'scores.html'));
    }
}