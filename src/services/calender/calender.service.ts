import { Injectable } from '@nestjs/common';
import { CalenderParamDto } from 'src/dtos/params/calender-param.dto';
import { PostTask } from 'src/entities/post-task.entity';
import { CalenderRepository } from 'src/repositories/calender-repository';
import { UnitOfWork } from 'src/unitofwork/unitofwork';

@Injectable()
export class CalenderService {

  constructor(
    private readonly unitOfWork: UnitOfWork
  ) { }

  async getCalenderList(paginatedParams: CalenderParamDto): Promise<any> {
    const calenderRepository = this.unitOfWork.getRepository(CalenderRepository, PostTask, false);
    const data = await calenderRepository.getCalenderList(paginatedParams);
    return data;
  }
}