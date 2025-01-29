import { Injectable } from '@nestjs/common';
import { GenericRepository } from './generic-repository';
import { Repository } from 'typeorm';
import { UserAnswer } from 'src/entities/user-answer.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UserAnswerRepository extends GenericRepository<UserAnswer> {
    constructor(
        @InjectRepository(UserAnswer)
        repository: Repository<UserAnswer>) {
        super(repository);
    }
    async deleteOptionData(optionAnswers, userId) {
        for (const answer of optionAnswers) {
            await this.repository.createQueryBuilder('user_answer')
                .delete()
                .where("user_id = :userId", { userId })
                .andWhere("question_id = :questionId", { questionId: answer.questionId })
                .andWhere("question_option_id NOT IN (:...optionIds)", { optionIds: answer.question_option_id.map((id: string) => parseInt(id)) })
                .execute();
        }

    }
    async deleteTextData(textAnswers, userId: number) {
        for (const answer of textAnswers) {
            await this.repository.createQueryBuilder('user_answer')
                .delete()
                .where("user_id = :userId", { userId })
                .andWhere("question_id = :questionId", { questionId: answer.questionId })
                .andWhere("question_option_id IS NULL")
                .andWhere("answer_text != :answerText", { answerText: answer.answer_text })
                .execute();
        }
    }
    async userAnswerOne(userId: number, questionId: number, question_option_id: number) {
        return await this.repository.createQueryBuilder('user_answer')
            .where("user_id = :userId", { userId })
            .andWhere("question_id = :questionId", { questionId})
            .andWhere("question_option_id = :question_option_id", { question_option_id })
            .getOne();
    }
}