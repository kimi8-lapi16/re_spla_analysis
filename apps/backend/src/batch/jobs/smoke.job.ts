import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BatchJob } from '../batch-job.interface';

interface ConnectivityRow {
  ok: number;
}

/**
 * バッチ実行基盤の疎通確認ジョブ。
 *
 * 実際の分析ジョブを実装する前に、以下をまとめて検証するために使う。
 * - コンテナイメージがバッチ用コマンドで起動できるか
 * - ECS タスクのサブネット / セキュリティグループから RDS に到達できるか
 * - Secrets Manager から注入した認証情報で接続できるか
 * - 終了コードと CloudWatch Logs が期待どおり出るか
 */
@Injectable()
export class SmokeJob implements BatchJob {
  readonly name = 'smoke';

  private readonly logger = new Logger(SmokeJob.name);

  constructor(private readonly prisma: PrismaService) {}

  async run(): Promise<void> {
    const rows = await this.prisma.$queryRaw<
      ConnectivityRow[]
    >`SELECT 1 AS \`ok\``;

    if (rows[0]?.ok !== 1) {
      throw new Error('Database connectivity check returned an unexpected row');
    }

    this.logger.log('Database connectivity check passed');
  }
}
