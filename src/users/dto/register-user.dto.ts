import { IsString, IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export class RegisterUserDto {

    //유효성 체크
    @IsString({ message: '문자로 입력' })
    @IsNotEmpty({ message: '닉네임을 입력' })
    @MinLength(1, { message: '닉네임은 최소 1글자 이상.' })
    @MaxLength(12, { message: '닉네임은 최대 12 글자까지만' })
    nickname: string;
}