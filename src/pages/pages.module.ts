import { Module } from '@nestjs/common';
import { GamePageController } from './game.page.controller';
import { PlayPageController } from './play.page.controller';
import { ScoresPageController } from './scores.page.controller';

@Module({
    controllers: [GamePageController, PlayPageController, ScoresPageController],
})
export class PagesModule {}