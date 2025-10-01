import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// 유저 엔티티 등록
import { User } from './user.entity';

// 유저 서비스 등록
import { UsersService } from './users.service';

// 유저 컨트롤러 등록
import { UsersController } from './users.controller';

// 이렇게 해두면 TypeORM의 autoLoadEntities 기능과 함께 user 테이블이 자동 생성됨
// (synchronize: true 기준)
@Module({
    imports: [TypeOrmModule.forFeature([User])],
    
    //유저 서비스 등록
    providers: [UsersService],
    
    //유저 컨트롤 등록
    controllers: [UsersController],

    // 다른 모듈에서 User 레포지토리를 주입받을 때 필요
    exports: [TypeOrmModule, UsersService],
})
export class UsersModule {}