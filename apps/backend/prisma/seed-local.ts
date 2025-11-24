import * as bcrypt from 'bcrypt';
import { config } from 'dotenv';
import { PrismaClient } from '../generated/prisma/client';
import { seedBaseMasterData } from './seed-base';

config();

const prisma = new PrismaClient();

// コマンドライン引数から目標レコード数を取得 (デフォルト: 10000)
const TARGET_MATCHES = parseInt(process.argv[2] || '10000', 10);

// バトルタイプのEnum（DBから取得したIDに対応）
const BATTLE_TYPE = {
  X: 1,
  OPEN: 2,
  CHALLENGE: 3,
} as const;

// マスターデータのID配列（起動時にDBから取得）
let RULE_IDS: number[] = [];
let STAGE_IDS: number[] = [];
let WEAPON_IDS: number[] = [];

// 結果
const RESULT = {
  WIN: 'WIN',
  LOSE: 'LOSE',
} as const;

interface MatchData {
  result: string;
  battleTypeId: number;
  stageId: number;
  ruleId: number;
  weaponId: number;
  gameDateTime: Date;
  point: number;
  userId: string;
}

// 配列からランダムに要素を取得
function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// 配列からランダムにN個の要素を取得（重複なし）
function randomSample<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

// 試合時間をランダムに生成（2-7分）
function randomMatchDuration(): number {
  // ノックアウト: 2-3分, 通常: 5-7分
  return Math.random() < 0.3
    ? 2 + Math.floor(Math.random() * 2) // 2-3分
    : 5 + Math.floor(Math.random() * 3); // 5-7分
}

// Xマッチのセット生成（3勝 or 3敗まで）
function generateXMatchSet(
  userId: string,
  ruleId: number,
  stageIds: number[],
  weaponIds: number[],
  baseTime: Date,
  basePoint: number,
): MatchData[] {
  const patterns = [
    // 3連勝
    ['WIN', 'WIN', 'WIN'],
    // 3勝1敗
    ['WIN', 'WIN', 'LOSE', 'WIN'],
    ['WIN', 'LOSE', 'WIN', 'WIN'],
    ['LOSE', 'WIN', 'WIN', 'WIN'],
    // 3勝2敗
    ['WIN', 'WIN', 'LOSE', 'LOSE', 'WIN'],
    ['WIN', 'LOSE', 'WIN', 'LOSE', 'WIN'],
    ['WIN', 'LOSE', 'LOSE', 'WIN', 'WIN'],
    ['LOSE', 'WIN', 'WIN', 'LOSE', 'WIN'],
    ['LOSE', 'WIN', 'LOSE', 'WIN', 'WIN'],
    ['LOSE', 'LOSE', 'WIN', 'WIN', 'WIN'],
    // 2勝3敗
    ['WIN', 'WIN', 'LOSE', 'LOSE', 'LOSE'],
    ['WIN', 'LOSE', 'WIN', 'LOSE', 'LOSE'],
    ['WIN', 'LOSE', 'LOSE', 'WIN', 'LOSE'],
    ['LOSE', 'WIN', 'WIN', 'LOSE', 'LOSE'],
    ['LOSE', 'WIN', 'LOSE', 'WIN', 'LOSE'],
    ['LOSE', 'LOSE', 'WIN', 'WIN', 'LOSE'],
    // 1勝3敗
    ['WIN', 'LOSE', 'LOSE', 'LOSE'],
    ['LOSE', 'WIN', 'LOSE', 'LOSE'],
    ['LOSE', 'LOSE', 'WIN', 'LOSE'],
    // 3連敗
    ['LOSE', 'LOSE', 'LOSE'],
  ];

  const pattern = randomChoice(patterns);
  const matches: MatchData[] = [];
  let currentTime = new Date(baseTime);
  let currentPoint = basePoint;

  pattern.forEach((result) => {
    // ポイントの増減（WIN: +10~50, LOSE: -10~50）
    const pointChange =
      result === 'WIN'
        ? 10 + Math.floor(Math.random() * 41)
        : -(10 + Math.floor(Math.random() * 41));
    currentPoint += pointChange;

    matches.push({
      result,
      battleTypeId: BATTLE_TYPE.X,
      stageId: randomChoice(stageIds),
      ruleId,
      weaponId: randomChoice(weaponIds),
      gameDateTime: new Date(currentTime),
      point: currentPoint,
      userId,
    });

    // 次の試合まで5-7分
    currentTime = new Date(
      currentTime.getTime() + randomMatchDuration() * 60 * 1000,
    );
  });

  return matches;
}

// チャレンジのセット生成（5勝 or 3敗まで）
function generateChallengeSet(
  userId: string,
  ruleId: number,
  stageIds: number[],
  weaponIds: number[],
  baseTime: Date,
  basePoint: number,
): MatchData[] {
  const patterns = [
    // 5連勝
    ['WIN', 'WIN', 'WIN', 'WIN', 'WIN'],
    // 5勝1敗
    ['WIN', 'WIN', 'WIN', 'WIN', 'LOSE', 'WIN'],
    ['WIN', 'WIN', 'WIN', 'LOSE', 'WIN', 'WIN'],
    ['WIN', 'WIN', 'LOSE', 'WIN', 'WIN', 'WIN'],
    ['WIN', 'LOSE', 'WIN', 'WIN', 'WIN', 'WIN'],
    ['LOSE', 'WIN', 'WIN', 'WIN', 'WIN', 'WIN'],
    // 5勝2敗
    ['WIN', 'WIN', 'WIN', 'WIN', 'LOSE', 'LOSE', 'WIN'],
    ['WIN', 'WIN', 'WIN', 'LOSE', 'WIN', 'LOSE', 'WIN'],
    ['WIN', 'WIN', 'WIN', 'LOSE', 'LOSE', 'WIN', 'WIN'],
    ['WIN', 'WIN', 'LOSE', 'WIN', 'WIN', 'LOSE', 'WIN'],
    ['WIN', 'WIN', 'LOSE', 'WIN', 'LOSE', 'WIN', 'WIN'],
    ['WIN', 'WIN', 'LOSE', 'LOSE', 'WIN', 'WIN', 'WIN'],
    ['WIN', 'LOSE', 'WIN', 'WIN', 'WIN', 'LOSE', 'WIN'],
    ['WIN', 'LOSE', 'WIN', 'WIN', 'LOSE', 'WIN', 'WIN'],
    ['WIN', 'LOSE', 'WIN', 'LOSE', 'WIN', 'WIN', 'WIN'],
    ['WIN', 'LOSE', 'LOSE', 'WIN', 'WIN', 'WIN', 'WIN'],
    ['LOSE', 'WIN', 'WIN', 'WIN', 'WIN', 'LOSE', 'WIN'],
    ['LOSE', 'WIN', 'WIN', 'WIN', 'LOSE', 'WIN', 'WIN'],
    ['LOSE', 'WIN', 'WIN', 'LOSE', 'WIN', 'WIN', 'WIN'],
    ['LOSE', 'WIN', 'LOSE', 'WIN', 'WIN', 'WIN', 'WIN'],
    ['LOSE', 'LOSE', 'WIN', 'WIN', 'WIN', 'WIN', 'WIN'],
    // 4勝3敗
    ['WIN', 'WIN', 'WIN', 'WIN', 'LOSE', 'LOSE', 'LOSE'],
    ['WIN', 'WIN', 'WIN', 'LOSE', 'WIN', 'LOSE', 'LOSE'],
    ['WIN', 'WIN', 'WIN', 'LOSE', 'LOSE', 'WIN', 'LOSE'],
    ['WIN', 'WIN', 'LOSE', 'WIN', 'WIN', 'LOSE', 'LOSE'],
    ['WIN', 'WIN', 'LOSE', 'WIN', 'LOSE', 'WIN', 'LOSE'],
    ['WIN', 'WIN', 'LOSE', 'LOSE', 'WIN', 'WIN', 'LOSE'],
    ['WIN', 'LOSE', 'WIN', 'WIN', 'WIN', 'LOSE', 'LOSE'],
    ['WIN', 'LOSE', 'WIN', 'WIN', 'LOSE', 'WIN', 'LOSE'],
    ['WIN', 'LOSE', 'WIN', 'LOSE', 'WIN', 'WIN', 'LOSE'],
    ['WIN', 'LOSE', 'LOSE', 'WIN', 'WIN', 'WIN', 'LOSE'],
    ['LOSE', 'WIN', 'WIN', 'WIN', 'WIN', 'LOSE', 'LOSE'],
    ['LOSE', 'WIN', 'WIN', 'WIN', 'LOSE', 'WIN', 'LOSE'],
    ['LOSE', 'WIN', 'WIN', 'LOSE', 'WIN', 'WIN', 'LOSE'],
    ['LOSE', 'WIN', 'LOSE', 'WIN', 'WIN', 'WIN', 'LOSE'],
    ['LOSE', 'LOSE', 'WIN', 'WIN', 'WIN', 'WIN', 'LOSE'],
    // 3勝3敗
    ['WIN', 'WIN', 'WIN', 'LOSE', 'LOSE', 'LOSE'],
    ['WIN', 'WIN', 'LOSE', 'WIN', 'LOSE', 'LOSE'],
    ['WIN', 'WIN', 'LOSE', 'LOSE', 'WIN', 'LOSE'],
    ['WIN', 'LOSE', 'WIN', 'WIN', 'LOSE', 'LOSE'],
    ['WIN', 'LOSE', 'WIN', 'LOSE', 'WIN', 'LOSE'],
    ['WIN', 'LOSE', 'LOSE', 'WIN', 'WIN', 'LOSE'],
    ['LOSE', 'WIN', 'WIN', 'WIN', 'LOSE', 'LOSE'],
    ['LOSE', 'WIN', 'WIN', 'LOSE', 'WIN', 'LOSE'],
    ['LOSE', 'WIN', 'LOSE', 'WIN', 'WIN', 'LOSE'],
    ['LOSE', 'LOSE', 'WIN', 'WIN', 'WIN', 'LOSE'],
    // 2勝3敗
    ['WIN', 'WIN', 'LOSE', 'LOSE', 'LOSE'],
    ['WIN', 'LOSE', 'WIN', 'LOSE', 'LOSE'],
    ['WIN', 'LOSE', 'LOSE', 'WIN', 'LOSE'],
    ['LOSE', 'WIN', 'WIN', 'LOSE', 'LOSE'],
    ['LOSE', 'WIN', 'LOSE', 'WIN', 'LOSE'],
    ['LOSE', 'LOSE', 'WIN', 'WIN', 'LOSE'],
    // 1勝3敗
    ['WIN', 'LOSE', 'LOSE', 'LOSE'],
    ['LOSE', 'WIN', 'LOSE', 'LOSE'],
    ['LOSE', 'LOSE', 'WIN', 'LOSE'],
    // 3連敗
    ['LOSE', 'LOSE', 'LOSE'],
  ];

  const pattern = randomChoice(patterns);
  const matches: MatchData[] = [];
  let currentTime = new Date(baseTime);
  let currentPoint = basePoint;

  pattern.forEach((result) => {
    // ポイントの増減（WIN: +5~15, LOSE: -5~15）
    const pointChange =
      result === 'WIN'
        ? 5 + Math.floor(Math.random() * 11)
        : -(5 + Math.floor(Math.random() * 11));
    currentPoint += pointChange;

    matches.push({
      result,
      battleTypeId: BATTLE_TYPE.CHALLENGE,
      stageId: randomChoice(stageIds),
      ruleId,
      weaponId: randomChoice(weaponIds),
      gameDateTime: new Date(currentTime),
      point: currentPoint,
      userId,
    });

    // 次の試合まで5-7分
    currentTime = new Date(
      currentTime.getTime() + randomMatchDuration() * 60 * 1000,
    );
  });

  return matches;
}

// オープンの試合生成（1試合ごと）
function generateOpenMatches(
  userId: string,
  ruleId: number,
  stageIds: number[],
  weaponIds: number[],
  baseTime: Date,
  basePoint: number,
  matchCount: number,
): MatchData[] {
  const matches: MatchData[] = [];
  let currentTime = new Date(baseTime);
  let currentPoint = basePoint;

  for (let i = 0; i < matchCount; i++) {
    const result = Math.random() > 0.5 ? RESULT.WIN : RESULT.LOSE;

    // ポイントの増減（WIN: +3~8, LOSE: -3~8）
    const pointChange =
      result === RESULT.WIN
        ? 3 + Math.floor(Math.random() * 6)
        : -(3 + Math.floor(Math.random() * 6));
    currentPoint += pointChange;

    matches.push({
      result,
      battleTypeId: BATTLE_TYPE.OPEN,
      stageId: randomChoice(stageIds),
      ruleId,
      weaponId: randomChoice(weaponIds),
      gameDateTime: new Date(currentTime),
      point: currentPoint,
      userId,
    });

    // 次の試合まで5-7分
    currentTime = new Date(
      currentTime.getTime() + randomMatchDuration() * 60 * 1000,
    );
  }

  return matches;
}

// ユーザーごとの全バトルタイプ・全ルールのマッチを生成
function generateUserMatches(
  userId: string,
  startDate: Date,
  setsPerBattleType: number,
): MatchData[] {
  const allMatches: MatchData[] = [];
  let currentDate = new Date(startDate);

  // 各ルールごとに処理
  RULE_IDS.forEach((ruleId, ruleIndex) => {
    // ローテーション用のステージ2つをランダム選択
    const rotationStages = randomSample(STAGE_IDS, 2);

    // Xマッチのセット（3勝 or 3敗）
    for (let setNum = 0; setNum < setsPerBattleType; setNum++) {
      // 奇数時からスタート（1, 3, 5, 7...）
      const hour = 1 + ruleIndex * 2 + setNum * 8;
      currentDate.setHours(hour, 0, 0, 0);

      const weaponIds = randomSample(WEAPON_IDS, 5);
      const basePoint = 2000 + Math.floor(Math.random() * 500);

      const xMatches = generateXMatchSet(
        userId,
        ruleId,
        rotationStages,
        weaponIds,
        currentDate,
        basePoint,
      );
      allMatches.push(...xMatches);
    }

    // チャレンジのセット（5勝 or 3敗）
    for (let setNum = 0; setNum < setsPerBattleType; setNum++) {
      const hour = 9 + ruleIndex * 2 + setNum * 8;
      currentDate.setHours(hour, 0, 0, 0);

      const weaponIds = randomSample(WEAPON_IDS, 7);
      const basePoint = 1000 + Math.floor(Math.random() * 200);

      const challengeMatches = generateChallengeSet(
        userId,
        ruleId,
        rotationStages,
        weaponIds,
        currentDate,
        basePoint,
      );
      allMatches.push(...challengeMatches);
    }

    // オープン（10試合）
    for (let setNum = 0; setNum < setsPerBattleType; setNum++) {
      const hour = 17 + ruleIndex * 2 + setNum * 8;
      currentDate.setHours(hour, 0, 0, 0);

      const weaponIds = randomSample(WEAPON_IDS, 10);
      const basePoint = 800 + Math.floor(Math.random() * 100);

      const openMatches = generateOpenMatches(
        userId,
        ruleId,
        rotationStages,
        weaponIds,
        currentDate,
        basePoint,
        10,
      );
      allMatches.push(...openMatches);
    }
  });

  return allMatches;
}

async function seedLocalData() {
  console.log('Seeding local development data...');
  console.log(`Target matches: ${TARGET_MATCHES}`);

  // マスターデータのIDを取得
  console.log('Fetching master data IDs...');
  const rules = await prisma.rule.findMany({ select: { id: true } });
  const stages = await prisma.stage.findMany({ select: { id: true } });
  const weapons = await prisma.weapon.findMany({ select: { id: true } });

  RULE_IDS = rules.map((r) => r.id);
  STAGE_IDS = stages.map((s) => s.id);
  WEAPON_IDS = weapons.map((w) => w.id);

  console.log(
    `Found ${RULE_IDS.length} rules, ${STAGE_IDS.length} stages, ${WEAPON_IDS.length} weapons`,
  );

  // ユーザー数を計算（各ユーザーが最低限のマッチを持つように）
  // 1ユーザーあたり: (X: 3-5試合 * 4ルール) + (Challenge: 5-8試合 * 4ルール) + (Open: 10試合 * 4ルール)
  // = 約18-20 + 20-32 + 40 = 78-92試合/ユーザー
  const estimatedMatchesPerUser = 85;
  const userCount = Math.max(
    10,
    Math.ceil(TARGET_MATCHES / estimatedMatchesPerUser),
  );

  console.log(`Generating ${userCount} users...`);

  // パスワードのハッシュ化
  const hashedPassword = await bcrypt.hash('password123', 10);

  // ユーザー作成
  const users: { id: string; email: string }[] = [];
  for (let i = 0; i < userCount; i++) {
    const email = `user${i + 1}@example.com`;
    const name = `テストユーザー${i + 1}`;

    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        name,
        email,
        secret: {
          create: {
            password: hashedPassword,
          },
        },
      },
    });

    users.push({ id: user.id, email: user.email });
  }
  console.log(`${userCount} users created`);

  // マッチデータ生成
  console.log('Generating match data...');

  const allMatches: MatchData[] = [];
  const startDate = new Date('2025-01-01T00:00:00Z');

  // 各ユーザーごとに必要なセット数を計算
  const setsPerBattleType = Math.ceil(TARGET_MATCHES / (userCount * 4 * 3 * 6));

  for (const user of users) {
    const userMatches = generateUserMatches(
      user.id,
      new Date(startDate),
      setsPerBattleType,
    );
    allMatches.push(...userMatches);
  }

  console.log(`Generated ${allMatches.length} matches`);

  // バッチ挿入（1000件ずつ）
  const batchSize = 1000;
  for (let i = 0; i < allMatches.length; i += batchSize) {
    const batch = allMatches.slice(i, i + batchSize);
    await prisma.match.createMany({
      data: batch,
    });
    console.log(
      `Inserted ${Math.min(i + batchSize, allMatches.length)} / ${allMatches.length} matches`,
    );
  }

  console.log('Local data seeding finished.');
  console.log(`Total matches created: ${allMatches.length}`);
}

async function main() {
  // マスターデータをseed
  await seedBaseMasterData(prisma);

  // ローカル開発用データをseed
  await seedLocalData();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
