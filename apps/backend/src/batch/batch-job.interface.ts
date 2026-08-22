/**
 * バッチジョブの共通インターフェース。
 *
 * ジョブは NestJS の Provider として実装し、BatchModule の BATCH_JOBS に登録する。
 * ロジック本体は Service 層に置き、ジョブは「引数を組み立てて Service を呼ぶ」だけに保つ。
 */
export interface BatchJob {
  /** CLI の第一引数として指定する名前 (例: `node dist/batch/main.js smoke`) */
  readonly name: string;

  run(): Promise<void>;
}

export const BATCH_JOBS = 'BATCH_JOBS';
