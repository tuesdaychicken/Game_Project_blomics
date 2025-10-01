// - id: 쿠키에 쓸 식별자
// - nickname: 유저가 쓴 닉네임
// - highScore: 지금까지 최고 점수, 초기값 0
// - lastScore: 마지막 게임의 점수, 초기값 0
// - createdAt/updatedAt: 생성/수정 시각 자동 기록

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('users') // 실제 DB 테이블 이름을 'users' 로 지정
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Index()
    @Column({ length: 32, unique: true })
    nickname: string;

    @Column({ type: 'integer', default: 0 })
    highScore: number;

    @Column({ type: 'integer', default: 0 })
    lastScore: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}