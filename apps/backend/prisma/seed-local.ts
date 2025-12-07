import * as bcrypt from 'bcrypt';
import { config } from 'dotenv';
import { PrismaClient } from '../generated/prisma/client';
import { seedBaseMasterData } from './seed-base';

config();

const prisma = new PrismaClient();

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

// シーズン定義（Xマッチのシーズンは3ヶ月単位）
// 12-2月, 3-5月, 6-8月, 9-11月
interface Season {
  name: string;
  startMonth: number; // 0-indexed (0 = January)
  endMonth: number;
  year: number;
}

function getSeasons(): Season[] {
  return [
    { name: '2024冬', startMonth: 11, endMonth: 1, year: 2024 }, // 2024/12 - 2025/2
    { name: '2025春', startMonth: 2, endMonth: 4, year: 2025 }, // 2025/3 - 2025/5
    { name: '2025夏', startMonth: 5, endMonth: 7, year: 2025 }, // 2025/6 - 2025/8
    { name: '2025秋', startMonth: 8, endMonth: 10, year: 2025 }, // 2025/9 - 2025/11
  ];
}

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
  return Math.random() < 0.3
    ? 2 + Math.floor(Math.random() * 2) // 2-3分（ノックアウト）
    : 5 + Math.floor(Math.random() * 3); // 5-7分（通常）
}

// シーズン内の日付リストを生成（プレイ日をシミュレート）
function generatePlayDatesInSeason(
  season: Season,
  daysToPlay: number,
): Date[] {
  const dates: Date[] = [];
  const startYear = season.startMonth === 11 ? season.year : season.year;
  const endYear = season.startMonth === 11 ? season.year + 1 : season.year;

  const startDate = new Date(startYear, season.startMonth, 1);
  const endDate =
    season.startMonth === 11
      ? new Date(endYear, season.endMonth + 1, 0)
      : new Date(endYear, season.endMonth + 1, 0);

  const totalDays = Math.floor(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
  );

  // ランダムにプレイ日を選択
  const playDayIndices = randomSample(
    Array.from({ length: totalDays }, (_, i) => i),
    Math.min(daysToPlay, totalDays),
  ).sort((a, b) => a - b);

  for (const dayIndex of playDayIndices) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + dayIndex);
    dates.push(date);
  }

  return dates;
}

// バトルタイプごとの設定
interface BattleTypeConfig {
  battleTypeId: number;
  patterns: string[][]; // 試合結果パターン（セット形式）または null（連戦形式）
  pointChangeMin: number;
  pointChangeMax: number;
}

const BATTLE_TYPE_CONFIGS: Record<'x' | 'challenge' | 'open', BattleTypeConfig> = {
  x: {
    battleTypeId: BATTLE_TYPE.X,
    patterns: [
      // 3勝パターン
      ['WIN', 'WIN', 'WIN'],
      ['WIN', 'WIN', 'LOSE', 'WIN'],
      ['WIN', 'LOSE', 'WIN', 'WIN'],
      ['LOSE', 'WIN', 'WIN', 'WIN'],
      ['WIN', 'WIN', 'LOSE', 'LOSE', 'WIN'],
      ['WIN', 'LOSE', 'WIN', 'LOSE', 'WIN'],
      ['WIN', 'LOSE', 'LOSE', 'WIN', 'WIN'],
      ['LOSE', 'WIN', 'WIN', 'LOSE', 'WIN'],
      ['LOSE', 'WIN', 'LOSE', 'WIN', 'WIN'],
      ['LOSE', 'LOSE', 'WIN', 'WIN', 'WIN'],
      // 3敗パターン
      ['WIN', 'WIN', 'LOSE', 'LOSE', 'LOSE'],
      ['WIN', 'LOSE', 'WIN', 'LOSE', 'LOSE'],
      ['WIN', 'LOSE', 'LOSE', 'WIN', 'LOSE'],
      ['LOSE', 'WIN', 'WIN', 'LOSE', 'LOSE'],
      ['LOSE', 'WIN', 'LOSE', 'WIN', 'LOSE'],
      ['LOSE', 'LOSE', 'WIN', 'WIN', 'LOSE'],
      ['WIN', 'LOSE', 'LOSE', 'LOSE'],
      ['LOSE', 'WIN', 'LOSE', 'LOSE'],
      ['LOSE', 'LOSE', 'WIN', 'LOSE'],
      ['LOSE', 'LOSE', 'LOSE'],
    ],
    pointChangeMin: 15,
    pointChangeMax: 75,
  },
  challenge: {
    battleTypeId: BATTLE_TYPE.CHALLENGE,
    patterns: [
      // 5勝パターン
      ['WIN', 'WIN', 'WIN', 'WIN', 'WIN'],
      ['WIN', 'WIN', 'WIN', 'WIN', 'LOSE', 'WIN'],
      ['WIN', 'WIN', 'WIN', 'LOSE', 'WIN', 'WIN'],
      ['WIN', 'WIN', 'LOSE', 'WIN', 'WIN', 'WIN'],
      ['WIN', 'LOSE', 'WIN', 'WIN', 'WIN', 'WIN'],
      ['LOSE', 'WIN', 'WIN', 'WIN', 'WIN', 'WIN'],
      ['WIN', 'WIN', 'WIN', 'WIN', 'LOSE', 'LOSE', 'WIN'],
      ['WIN', 'WIN', 'LOSE', 'LOSE', 'WIN', 'WIN', 'WIN'],
      ['LOSE', 'LOSE', 'WIN', 'WIN', 'WIN', 'WIN', 'WIN'],
      // 3敗パターン
      ['WIN', 'WIN', 'WIN', 'WIN', 'LOSE', 'LOSE', 'LOSE'],
      ['WIN', 'WIN', 'WIN', 'LOSE', 'LOSE', 'LOSE'],
      ['WIN', 'WIN', 'LOSE', 'LOSE', 'LOSE'],
      ['WIN', 'LOSE', 'LOSE', 'LOSE'],
      ['LOSE', 'LOSE', 'LOSE'],
    ],
    pointChangeMin: 0,
    pointChangeMax: 20,
  },
  open: {
    battleTypeId: BATTLE_TYPE.OPEN,
    patterns: [], // オープンはパターンではなく連戦形式
    pointChangeMin: 8,
    pointChangeMax: 8,
  },
};

// マッチセット生成（パターンベース: Xマッチ、チャレンジ）
function generateMatchSet(
  userId: string,
  ruleId: number,
  stageIds: number[],
  weaponIds: number[],
  baseTime: Date,
  currentPoint: number,
  config: BattleTypeConfig,
): { matches: MatchData[]; finalPoint: number } {
  const pattern = randomChoice(config.patterns);
  const matches: MatchData[] = [];
  let currentTime = new Date(baseTime);
  let point = currentPoint;
  const pointRange = config.pointChangeMax - config.pointChangeMin + 1;

  for (const result of pattern) {
    const pointChange =
      result === 'WIN'
        ? config.pointChangeMin + Math.floor(Math.random() * pointRange)
        : -(config.pointChangeMin + Math.floor(Math.random() * pointRange));
    point += pointChange;

    matches.push({
      result,
      battleTypeId: config.battleTypeId,
      stageId: randomChoice(stageIds),
      ruleId,
      weaponId: randomChoice(weaponIds),
      gameDateTime: new Date(currentTime),
      point,
      userId,
    });

    currentTime = new Date(
      currentTime.getTime() + randomMatchDuration() * 60 * 1000,
    );
  }

  return { matches, finalPoint: point };
}

// 連戦形式のマッチ生成（オープン）
function generateConsecutiveMatches(
  userId: string,
  ruleId: number,
  stageIds: number[],
  weaponIds: number[],
  baseTime: Date,
  currentPoint: number,
  matchCount: number,
  config: BattleTypeConfig,
): { matches: MatchData[]; finalPoint: number } {
  const matches: MatchData[] = [];
  let currentTime = new Date(baseTime);
  let point = currentPoint;
  const pointRange = config.pointChangeMax - config.pointChangeMin + 1;

  for (let i = 0; i < matchCount; i++) {
    const result = Math.random() > 0.5 ? RESULT.WIN : RESULT.LOSE;
    const pointChange =
      result === RESULT.WIN
        ? config.pointChangeMin + Math.floor(Math.random() * pointRange)
        : -(config.pointChangeMin + Math.floor(Math.random() * pointRange));
    point += pointChange;

    matches.push({
      result,
      battleTypeId: config.battleTypeId,
      stageId: randomChoice(stageIds),
      ruleId,
      weaponId: randomChoice(weaponIds),
      gameDateTime: new Date(currentTime),
      point,
      userId,
    });

    currentTime = new Date(
      currentTime.getTime() + randomMatchDuration() * 60 * 1000,
    );
  }

  return { matches, finalPoint: point };
}

// 1ユーザーの1シーズン分のマッチを生成
function generateUserSeasonMatches(
  userId: string,
  season: Season,
  initialPoints: {
    x: Record<number, number>;
    challenge: Record<number, number>;
    open: Record<number, number>;
  },
): {
  matches: MatchData[];
  finalPoints: {
    x: Record<number, number>;
    challenge: Record<number, number>;
    open: Record<number, number>;
  };
} {
  const allMatches: MatchData[] = [];
  const currentPoints = {
    x: { ...initialPoints.x },
    challenge: { ...initialPoints.challenge },
    open: { ...initialPoints.open },
  };

  // シーズン中に20-40日プレイ
  const playDays = generatePlayDatesInSeason(
    season,
    20 + Math.floor(Math.random() * 21),
  );

  for (const playDate of playDays) {
    // その日にプレイするルールをランダムに1-2個選択
    const rulesToPlay = randomSample(RULE_IDS, 1 + Math.floor(Math.random() * 2));

    for (const ruleId of rulesToPlay) {
      const rotationStages = randomSample(STAGE_IDS, 2);
      const weaponIds = randomSample(WEAPON_IDS, 5);

      // バトルタイプをランダムに選択（重み付け: X:40%, Challenge:35%, Open:25%）
      const battleTypeRoll = Math.random();
      let battleType: 'x' | 'challenge' | 'open';
      if (battleTypeRoll < 0.4) {
        battleType = 'x';
      } else if (battleTypeRoll < 0.75) {
        battleType = 'challenge';
      } else {
        battleType = 'open';
      }

      // 時間帯をランダムに設定（19:00-23:00が多い）
      const hour =
        Math.random() < 0.7
          ? 19 + Math.floor(Math.random() * 5) // 19-23時
          : 10 + Math.floor(Math.random() * 9); // 10-18時
      playDate.setHours(hour, Math.floor(Math.random() * 60), 0, 0);

      if (battleType === 'open') {
        const matchCount = 5 + Math.floor(Math.random() * 6); // 5-10試合
        const result = generateConsecutiveMatches(
          userId,
          ruleId,
          rotationStages,
          weaponIds,
          playDate,
          currentPoints.open[ruleId],
          matchCount,
          BATTLE_TYPE_CONFIGS.open,
        );
        allMatches.push(...result.matches);
        currentPoints.open[ruleId] = result.finalPoint;
      } else {
        const config = BATTLE_TYPE_CONFIGS[battleType];
        const result = generateMatchSet(
          userId,
          ruleId,
          rotationStages,
          weaponIds,
          playDate,
          currentPoints[battleType][ruleId],
          config,
        );
        allMatches.push(...result.matches);
        currentPoints[battleType][ruleId] = result.finalPoint;
      }
    }
  }

  return { matches: allMatches, finalPoints: currentPoints };
}

// ユーザーの全シーズン分のマッチを生成
function generateUserAllSeasonsMatches(userId: string): MatchData[] {
  const allMatches: MatchData[] = [];
  const seasons = getSeasons();

  // 各ルールごとの初期ポイント
  let currentPoints = {
    x: {} as Record<number, number>,
    challenge: {} as Record<number, number>,
    open: {} as Record<number, number>,
  };

  // 初期ポイントを設定
  for (const ruleId of RULE_IDS) {
    currentPoints.x[ruleId] = 1800 + Math.floor(Math.random() * 400); // 1800-2200
    currentPoints.challenge[ruleId] = 600 + Math.floor(Math.random() * 200); // 800-1200
    currentPoints.open[ruleId] = 600 + Math.floor(Math.random() * 200); // 600-800
  }

  for (const season of seasons) {
    console.log(`  Generating ${season.name} matches...`);
    const result = generateUserSeasonMatches(userId, season, currentPoints);
    allMatches.push(...result.matches);

    // シーズン切り替え時にXマッチのポイントをリセット（少し変動を加える）
    for (const ruleId of RULE_IDS) {
      // Xマッチは新シーズンで初期レート付近にリセット
      currentPoints.x[ruleId] =
        1800 + Math.floor(Math.random() * 400) + (result.finalPoints.x[ruleId] - 2000) * 0.3;
      // チャレンジとオープンは継続
      currentPoints.challenge[ruleId] = result.finalPoints.challenge[ruleId];
      currentPoints.open[ruleId] = result.finalPoints.open[ruleId];
    }
  }

  return allMatches;
}

async function seedLocalData() {
  console.log('Seeding local development data...');

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

  // 3人のユーザーを作成
  const userCount = 3;
  console.log(`Generating ${userCount} users...`);

  const hashedPassword = await bcrypt.hash('password123', 10);

  const users: { id: string; email: string; name: string }[] = [];
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

    users.push({ id: user.id, email: user.email, name });
  }
  console.log(`${userCount} users created`);

  // マッチデータ生成
  console.log('Generating match data across 4 seasons...');

  const allMatches: MatchData[] = [];

  for (const user of users) {
    console.log(`Generating matches for ${user.name}...`);
    const userMatches = generateUserAllSeasonsMatches(user.id);
    allMatches.push(...userMatches);
    console.log(`  Generated ${userMatches.length} matches`);
  }

  // 日時でソート
  allMatches.sort(
    (a, b) => a.gameDateTime.getTime() - b.gameDateTime.getTime(),
  );

  console.log(`Total generated: ${allMatches.length} matches`);

  // 既存のマッチを削除
  await prisma.match.deleteMany({});
  console.log('Cleared existing matches');

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
