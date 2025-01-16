import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppDataSource } from '../data-source';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: async () => {
        const dataSource = await AppDataSource;  
        await dataSource.initialize(); 
        return {
          ...dataSource.options, 
        };
      },
    }),
  ],
})
export class DatabaseModule {}
