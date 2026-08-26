import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { BATCH_JOBS, BatchJob } from './batch-job.interface';
import { JobRunner } from './job-runner';
import { SmokeJob } from './jobs/smoke.job';

/**
 * バッチ実行専用のルートモジュール。
 *
 * HTTP サーバーを起動しないため AppModule とは分けている。
 * 新しいジョブを追加するときは providers と BATCH_JOBS の inject に足す。
 */
@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule],
  providers: [
    SmokeJob,
    JobRunner,
    {
      provide: BATCH_JOBS,
      useFactory: (...jobs: BatchJob[]): BatchJob[] => jobs,
      inject: [SmokeJob],
    },
  ],
})
export class BatchModule {}
