import { Inject, Injectable, Logger } from '@nestjs/common';
import { BATCH_JOBS, BatchJob } from './batch-job.interface';

@Injectable()
export class JobRunner {
  private readonly logger = new Logger(JobRunner.name);

  constructor(@Inject(BATCH_JOBS) private readonly jobs: BatchJob[]) {}

  listJobNames(): string[] {
    return this.jobs.map((job) => job.name);
  }

  async run(jobName: string): Promise<void> {
    const job = this.jobs.find((candidate) => candidate.name === jobName);

    if (!job) {
      throw new Error(
        `Unknown job: ${jobName}. Available jobs: ${this.listJobNames().join(', ')}`,
      );
    }

    const startedAt = Date.now();
    this.logger.log(`Job started: ${job.name}`);

    await job.run();

    this.logger.log(`Job finished: ${job.name} (${Date.now() - startedAt}ms)`);
  }
}
