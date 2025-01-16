
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; 
import { UnitOfWork } from 'src/unitofwork/unitofwork';

@Module({
  imports: [TypeOrmModule.forFeature([])], 
  providers: [UnitOfWork],
  exports: [UnitOfWork], 
})
export class UnitOfWorkModule {}