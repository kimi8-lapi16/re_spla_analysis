import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { BatchModule } from './batch.module';
import { JobRunner } from './job-runner';

/**
 * バッチ用の CLI エントリポイント。
 *
 *   node dist/batch/main.js <jobName>
 *
 * HTTP サーバーを立てずに DI コンテナだけを起動し、ジョブを1つ実行して終了する。
 * ECS の RunTask では command override でジョブ名を渡す。
 * 終了コードは EventBridge の失敗検知に使うため、必ず 0 / 1 を返す。
 */
async function bootstrap(): Promise<void> {
  const logger = new Logger('Batch');
  const jobName = process.argv[2];

  if (!jobName) {
    logger.error('Job name is required: node dist/batch/main.js <jobName>');
    process.exitCode = 1;
    return;
  }

  const context = await NestFactory.createApplicationContext(BatchModule, {
    // バッチのログは CloudWatch Logs に流すため、行数を抑える
    logger: ['error', 'warn', 'log'],
  });
  context.enableShutdownHooks();

  try {
    await context.get(JobRunner).run(jobName);
    process.exitCode = 0;
  } catch (error) {
    logger.error(
      `Job failed: ${jobName}`,
      error instanceof Error ? error.stack : String(error),
    );
    process.exitCode = 1;
  } finally {
    await context.close();
  }
}

void bootstrap();
