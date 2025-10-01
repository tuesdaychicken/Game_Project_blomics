import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScoresService } from './scores.service';
import { User } from '../users/user.entity';

//컨트롤러 추가
import { ScoresController } from './scores.controller';

@Module({
    imports: [TypeOrmModule.forFeature([User])],
    providers: [ScoresService],
    controllers: [ScoresController],
    exports: [ScoresService],
})
export class ScoresModule {}