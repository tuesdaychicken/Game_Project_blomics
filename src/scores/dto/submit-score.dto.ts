import { IsInt, Min } from 'class-validator';

//들어오는 점수값 유효성 체크
export class SubmitScoreDto {
    @IsInt({ message: 'score는 정수여야 합니다.' })
    
    //0도 포함
    @Min(0, { message: 'score는 0 이상' })
    score: number;
}