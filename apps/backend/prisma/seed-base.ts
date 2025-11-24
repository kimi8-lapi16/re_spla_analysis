import { config } from "dotenv";
import { PrismaClient } from "../generated/prisma/client";

config();

const subWeapons = [
  { id: 1, name: 'カーリングボム' },
  { id: 2, name: 'キューバンボム' },
  { id: 3, name: 'クイックボム' },
  { id: 4, name: 'ジャンプビーコン' },
  { id: 5, name: 'スプラッシュシールド' },
  { id: 6, name: 'スプラッシュボム' },
  { id: 7, name: 'スプリンクラー' },
  { id: 8, name: 'タンサンボム' },
  { id: 9, name: 'トラップ' },
  { id: 10, name: 'トーピード' },
  { id: 11, name: 'ポイズンミスト' },
  { id: 12, name: 'ポイントセンサー' },
  { id: 13, name: 'ラインマーカー' },
  { id: 14, name: 'ロボットボム' }
];

const specialWeapons = [
  { id: 1, name: 'アメフラシ' },
  { id: 2, name: 'ウルトラショット' },
  { id: 3, name: 'ウルトラチャクチ' },
  { id: 4, name: 'ウルトラハンコ' },
  { id: 5, name: 'エナジースタンド' },
  { id: 6, name: 'カニタンク' },
  { id: 7, name: 'キューインキ' },
  { id: 8, name: 'グレートバリア' },
  { id: 9, name: 'サメライド' },
  { id: 10, name: 'ショクワンダー' },
  { id: 11, name: 'ジェットパック' },
  { id: 12, name: 'スミナガシート' },
  { id: 13, name: 'テイオウイカ' },
  { id: 14, name: 'デコイチラシ' },
  { id: 15, name: 'トリプルトルネード' },
  { id: 16, name: 'ナイスダマ' },
  { id: 17, name: 'ホップソナー' },
  { id: 18, name: 'マルチミサイル' },
  { id: 19, name: 'メガホンレーザー5.1ch' }
];

const weapons = [
  { name: 'わかばシューター', subWeaponId: 6, specialWeaponId: 8 },
  { name: 'スプラシューター', subWeaponId: 2, specialWeaponId: 2 },
  { name: 'プロモデラーMG', subWeaponId: 8, specialWeaponId: 9 },
  { name: 'N-ZAP85', subWeaponId: 2, specialWeaponId: 5 },
  { name: 'もみじシューター', subWeaponId: 10, specialWeaponId: 17 },
  { name: 'ボールドマーカー', subWeaponId: 1, specialWeaponId: 4 },
  { name: 'スペースシューター', subWeaponId: 12, specialWeaponId: 19 },
  { name: 'プライムシューター', subWeaponId: 13, specialWeaponId: 6 },
  { name: '52ガロン', subWeaponId: 5, specialWeaponId: 19 },
  { name: 'N-ZAP89', subWeaponId: 14, specialWeaponId: 14 },
  { name: 'スペースシューターコラボ', subWeaponId: 9, specialWeaponId: 11 },
  { name: 'L3リールガン', subWeaponId: 1, specialWeaponId: 6 },
  { name: 'ボールドマーカーネオ', subWeaponId: 4, specialWeaponId: 19 },
  { name: 'ジェットスイーパー', subWeaponId: 13, specialWeaponId: 7 },
  { name: 'シャープマーカー', subWeaponId: 3, specialWeaponId: 6 },
  { name: '96ガロン', subWeaponId: 7, specialWeaponId: 7 },
  { name: 'プロモデラーRG', subWeaponId: 7, specialWeaponId: 16 },
  { name: 'L3リールガンD', subWeaponId: 3, specialWeaponId: 4 },
  { name: 'ボトルガイザー', subWeaponId: 5, specialWeaponId: 2 },
  { name: 'ジェットスイーパーカスタム', subWeaponId: 11, specialWeaponId: 1 },
  { name: 'プライムシューターコラボ', subWeaponId: 2, specialWeaponId: 16 },
  { name: 'シャープマーカーネオ', subWeaponId: 2, specialWeaponId: 15 },
  { name: '96ガロンデコ', subWeaponId: 5, specialWeaponId: 13 },
  { name: 'H3リールガン', subWeaponId: 12, specialWeaponId: 5 },
  { name: 'H3リールガンD', subWeaponId: 5, specialWeaponId: 8 },
  { name: 'ヒーローシューターレプリカ', subWeaponId: 2, specialWeaponId: 2 },
  { name: 'スプラローラー', subWeaponId: 1, specialWeaponId: 8 },
  { name: 'カーボンローラー', subWeaponId: 14, specialWeaponId: 10 },
  { name: 'スプラローラーコラボ', subWeaponId: 4, specialWeaponId: 13 },
  { name: 'ダイナモローラー', subWeaponId: 7, specialWeaponId: 5 },
  { name: 'ワイドローラー', subWeaponId: 5, specialWeaponId: 7 },
  { name: 'ワイドローラーコラボ', subWeaponId: 13, specialWeaponId: 1 },
  { name: 'ヴァリアブルローラー', subWeaponId: 9, specialWeaponId: 18 },
  { name: 'カーボンローラーデコ', subWeaponId: 3, specialWeaponId: 2 },
  { name: 'スプラチャージャー', subWeaponId: 6, specialWeaponId: 7 },
  { name: 'スクイックリンα', subWeaponId: 12, specialWeaponId: 8 },
  { name: 'スプラチャージャーコラボ', subWeaponId: 5, specialWeaponId: 15 },
  { name: 'スプラスコープ', subWeaponId: 6, specialWeaponId: 7 },
  { name: 'R-PEN/5H', subWeaponId: 7, specialWeaponId: 5 },
  { name: 'リッター4K', subWeaponId: 9, specialWeaponId: 17 },
  { name: 'スプラスコープコラボ', subWeaponId: 5, specialWeaponId: 15 },
  { name: '14式竹筒銃・甲', subWeaponId: 14, specialWeaponId: 19 },
  { name: 'ソイチューバー', subWeaponId: 10, specialWeaponId: 18 },
  { name: '4Kスコープ', subWeaponId: 9, specialWeaponId: 17 },
  { name: 'バケットスロッシャー', subWeaponId: 6, specialWeaponId: 15 },
  { name: 'ヒッセン', subWeaponId: 11, specialWeaponId: 11 },
  { name: 'バケットスロッシャーデコ', subWeaponId: 13, specialWeaponId: 10 },
  { name: 'スクリュースロッシャー', subWeaponId: 8, specialWeaponId: 16 },
  { name: 'ヒッセンヒュー', subWeaponId: 8, specialWeaponId: 5 },
  { name: 'オーバーフロッシャー', subWeaponId: 7, specialWeaponId: 1 },
  { name: 'エクスプロッシャー', subWeaponId: 12, specialWeaponId: 1 },
  { name: 'バレルスピナー', subWeaponId: 7, specialWeaponId: 17 },
  { name: 'スプラスピナー', subWeaponId: 3, specialWeaponId: 4 },
  { name: 'バレルスピナーデコ', subWeaponId: 12, specialWeaponId: 13 },
  { name: 'ハイドラント', subWeaponId: 14, specialWeaponId: 16 },
  { name: 'スプラスピナーコラボ', subWeaponId: 11, specialWeaponId: 8 },
  { name: 'ノーチラス47', subWeaponId: 12, specialWeaponId: 1 },
  { name: 'クーゲルシュライバー', subWeaponId: 8, specialWeaponId: 11 },
  { name: 'スプラマニューバー', subWeaponId: 2, specialWeaponId: 6 },
  { name: 'デュアルスイーパー', subWeaponId: 6, specialWeaponId: 17 },
  { name: 'スパッタリー', subWeaponId: 4, specialWeaponId: 5 },
  { name: 'デュアルスイーパーカスタム', subWeaponId: 4, specialWeaponId: 14 },
  { name: 'クアッドホッパーブラック', subWeaponId: 14, specialWeaponId: 9 },
  { name: 'ケルビン525', subWeaponId: 5, specialWeaponId: 16 },
  { name: 'クアッドホッパーホワイト', subWeaponId: 7, specialWeaponId: 10 },
  { name: 'スパッタリーヒュー', subWeaponId: 10, specialWeaponId: 9 },
  { name: 'パラシェルター', subWeaponId: 7, specialWeaponId: 15 },
  { name: 'キャンピングシェルター', subWeaponId: 4, specialWeaponId: 7 },
  { name: 'スパイガジェット', subWeaponId: 9, specialWeaponId: 9 },
  { name: 'キャンピングシェルターソレーラ', subWeaponId: 9, specialWeaponId: 2 },
  { name: 'ホットブラスター', subWeaponId: 14, specialWeaponId: 8 },
  { name: 'ラピッドブラスター', subWeaponId: 9, specialWeaponId: 15 },
  { name: 'ラピッドブラスターデコ', subWeaponId: 10, specialWeaponId: 11 },
  { name: 'ロングブラスター', subWeaponId: 2, specialWeaponId: 17 },
  { name: 'ノヴァブラスター', subWeaponId: 6, specialWeaponId: 10 },
  { name: 'S-BLAST92', subWeaponId: 7, specialWeaponId: 9 },
  { name: 'クラッシュブラスター', subWeaponId: 6, specialWeaponId: 2 },
  { name: 'ノヴァブラスターネオ', subWeaponId: 8, specialWeaponId: 4 },
  { name: 'クラッシュブラスターネオ', subWeaponId: 1, specialWeaponId: 14 },
  { name: 'Rブラスターエリート', subWeaponId: 11, specialWeaponId: 7 },
  { name: 'Rブラスターエリートデコ', subWeaponId: 13, specialWeaponId: 19 },
  { name: 'ホクサイ', subWeaponId: 2, specialWeaponId: 10 },
  { name: 'パブロ', subWeaponId: 6, specialWeaponId: 19 },
  { name: 'フィンセント', subWeaponId: 1, specialWeaponId: 17 },
  { name: 'パブロヒュー', subWeaponId: 9, specialWeaponId: 4 },
  { name: 'トライストリンガー', subWeaponId: 11, specialWeaponId: 19 },
  { name: 'LACT-450', subWeaponId: 1, specialWeaponId: 18 },
  { name: 'ドライブワイパー', subWeaponId: 10, specialWeaponId: 4 },
  { name: 'ドライブワイパーデコ', subWeaponId: 4, specialWeaponId: 18 },
  { name: 'ジムワイパー', subWeaponId: 3, specialWeaponId: 10 },
  { name: 'モップリン', subWeaponId: 2, specialWeaponId: 9 },
  { name: 'イグザミナー', subWeaponId: 1, specialWeaponId: 5 },
  { name: 'ダイナモローラーテスラ', subWeaponId: 6, specialWeaponId: 14 },
  { name: 'ホクサイ・ヒュー', subWeaponId: 4, specialWeaponId: 1 },
  { name: 'ソイチューバーカスタム', subWeaponId: 8, specialWeaponId: 4 },
  { name: 'スクリュースロッシャーベッチュー', subWeaponId: 12, specialWeaponId: 2 },
  { name: 'オーバーフロッシャーデコ', subWeaponId: 13, specialWeaponId: 13 },
  { name: 'クーゲルシュライバー・ヒュー', subWeaponId: 9, specialWeaponId: 7 },
  { name: 'パラシェルターソレーラ', subWeaponId: 14, specialWeaponId: 11 },
  { name: 'トライストリンガーコラボ', subWeaponId: 7, specialWeaponId: 14 },
  { name: 'R-PEN/5B', subWeaponId: 5, specialWeaponId: 1 },
  { name: 'フィンセント・ヒュー', subWeaponId: 12, specialWeaponId: 18 },
  { name: 'ボトルガイザーフォイル', subWeaponId: 14, specialWeaponId: 12 },
  { name: 'スパイガジェットソレーラ', subWeaponId: 10, specialWeaponId: 12 },
  { name: 'LACT-450デコ', subWeaponId: 5, specialWeaponId: 9 },
  { name: 'S-BLAST91', subWeaponId: 3, specialWeaponId: 16 },
  { name: 'ジムワイバー・ヒュー', subWeaponId: 11, specialWeaponId: 6 },
  { name: 'スプラマニューバーコラボ', subWeaponId: 1, specialWeaponId: 3 },
  { name: 'ホットブラスターカスタム', subWeaponId: 12, specialWeaponId: 3 },
  { name: '24式張替傘・甲', subWeaponId: 13, specialWeaponId: 8 },
  { name: 'ガエンFF', subWeaponId: 9, specialWeaponId: 19 },
  { name: '.52ガロンデコ', subWeaponId: 1, specialWeaponId: 12 },
  { name: 'ケルビン525デコ', subWeaponId: 12, specialWeaponId: 2 },
  { name: 'スクイックリンβ', subWeaponId: 14, specialWeaponId: 10 },
  { name: 'モップリンD', subWeaponId: 4, specialWeaponId: 17 },
  { name: 'ヴァリアブルローラーフォイル', subWeaponId: 2, specialWeaponId: 12 },
  { name: 'ノーチラス79', subWeaponId: 2, specialWeaponId: 3 },
  { name: 'リッター4Kカスタム', subWeaponId: 4, specialWeaponId: 13 },
  { name: '4Kスコープカスタム', subWeaponId: 4, specialWeaponId: 13 },
  { name: 'エクスプロッシャーカスタム', subWeaponId: 5, specialWeaponId: 3 },
  { name: 'オーダーマニューバーレプリカ', subWeaponId: 2, specialWeaponId: 6 },
  { name: 'オーダーシェルターレプリカ', subWeaponId: 7, specialWeaponId: 15 },
  { name: 'オーダーシューターレプリカ', subWeaponId: 2, specialWeaponId: 2 },
  { name: 'オーダーローラーレプリカ', subWeaponId: 1, specialWeaponId: 8 },
  { name: 'オーダーチャージャーレプリカ', subWeaponId: 6, specialWeaponId: 7 },
  { name: 'オーダーストリンガーレプリカ', subWeaponId: 11, specialWeaponId: 19 },
  { name: 'オーダーワイパーレプリカ', subWeaponId: 3, specialWeaponId: 10 },
  { name: 'オーダースロッシャーレプリカ', subWeaponId: 6, specialWeaponId: 15 },
  { name: 'オーダーブラスターレプリカ', subWeaponId: 6, specialWeaponId: 10 },
  { name: 'オーダーブラシレプリカ', subWeaponId: 2, specialWeaponId: 10 },
  { name: 'オーダースピナーレプリカ', subWeaponId: 7, specialWeaponId: 17 },
  { name: 'オクタシューターレプリカ', subWeaponId: 6, specialWeaponId: 15 },
  { name: 'ロングブラスターカスタム', subWeaponId: 6, specialWeaponId: 13 },
  { name: '14式竹筒・乙', subWeaponId: 8, specialWeaponId: 14 },
  { name: 'ハイドラントカスタム', subWeaponId: 9, specialWeaponId: 12 },
  { name: 'イグザミナー・ヒュー', subWeaponId: 6, specialWeaponId: 6 },
  { name: 'ガエンFFカスタム', subWeaponId: 3, specialWeaponId: 15 },
  { name: '24式張替傘・乙', subWeaponId: 11, specialWeaponId: 3 },
  { name: 'フルイドV', subWeaponId: 14, specialWeaponId: 4 },
  { name: 'フルイドVカスタム', subWeaponId: 12, specialWeaponId: 17 },
  { name: 'デンタルワイパーミント', subWeaponId: 2, specialWeaponId: 8 },
  { name: 'デンタルワイパースミ', subWeaponId: 5, specialWeaponId: 11 },
  { name: 'ホットブラスター艶', subWeaponId: 4, specialWeaponId: 6 },
  { name: 'スプラチャージャーFRST', subWeaponId: 7, specialWeaponId: 6 },
  { name: 'ホクサイ彗', subWeaponId: 14, specialWeaponId: 13 },
  { name: 'スプラシューター煌', subWeaponId: 3, specialWeaponId: 13 },
  { name: 'トライストリンガー燈', subWeaponId: 13, specialWeaponId: 11 },
  { name: 'ドライブワイパーRUST', subWeaponId: 1, specialWeaponId: 2 },
  { name: 'スプラマニューバー耀', subWeaponId: 8, specialWeaponId: 8 },
  { name: 'LACT-450MILK', subWeaponId: 10, specialWeaponId: 16 },
  { name: 'デュアルスイーパー蹄', subWeaponId: 12, specialWeaponId: 12 },
  { name: 'スプラスコープFRST', subWeaponId: 7, specialWeaponId: 6 },
  { name: 'フィンセントBRNZ', subWeaponId: 5, specialWeaponId: 2 },
  { name: 'ダイナモローラー冥', subWeaponId: 12, specialWeaponId: 19 },
  { name: 'ヒッセンASH', subWeaponId: 6, specialWeaponId: 12 },
  { name: 'プロモデラー彩', subWeaponId: 3, specialWeaponId: 12 },
  { name: 'L3リールガン箔', subWeaponId: 6, specialWeaponId: 11 },
  { name: 'モップリン角', subWeaponId: 1, specialWeaponId: 6 },
  { name: 'ジェットスイーパーCOBR', subWeaponId: 3, specialWeaponId: 3 },
  { name: 'ワイドローラー惑', subWeaponId: 10, specialWeaponId: 3 },
  { name: 'ジムワイパー封', subWeaponId: 14, specialWeaponId: 16 },
  { name: 'シャープマーカーGECK', subWeaponId: 11, specialWeaponId: 1 },
  { name: 'プライムシューターFRZN', subWeaponId: 6, specialWeaponId: 18 },
  { name: 'カーボンローラーANGL', subWeaponId: 8, specialWeaponId: 14 },
  { name: '96ガロン爪', subWeaponId: 13, specialWeaponId: 5 },
  { name: 'キャンピングシェルターCREM', subWeaponId: 11, specialWeaponId: 14 },
  { name: 'ハイドラント圧', subWeaponId: 7, specialWeaponId: 8 },
  { name: 'スパイガジェット繚', subWeaponId: 1, specialWeaponId: 19 },
  { name: 'スプラスピナーPYTN', subWeaponId: 4, specialWeaponId: 2 },
  { name: 'スパッタリーOWL', subWeaponId: 6, specialWeaponId: 19 },
  { name: 'H3リールガンSNAK', subWeaponId: 2, specialWeaponId: 15 },
  { name: 'RブラスターエリートWNTR', subWeaponId: 2, specialWeaponId: 5 }
];

const battleTypes = ['Xマッチ', 'オープン', 'チャレンジ'];

const rules = [
  'ガチエリア',
  'ガチヤグラ',
  'ガチホコバトル',
  'ガチアサリ',
];

const stages = [
  'ユノハナ大渓谷','ゴンズイ地区','ヤガラ市場','マテガイ放水路','ナメロウ金属',
  'マサバ海峡大橋','キンメダイ美術館','マヒマヒリゾート&スパ','海女美術大学',
  'チョウザメ造船','ザトウマーケット','スメーシーワールド','クサヤ温泉',
  'ヒラメが丘団地','ナンプラー遺跡','マンタマリア号','オヒョウ海運',
  'タカアシ経済特区','バイガイ亭','ネギトロ炭鉱','カジキ空港','リュウグウターミナル',
  'デカライン高架下'
];

export async function seedBaseMasterData(prisma: PrismaClient) {
  console.log('Seeding base master data...');

  // Seed BattleType
  await prisma.battleType.createMany({
    data: battleTypes.map(name => ({ name })),
    skipDuplicates: true,
  });
  console.log('Battle types seeded');

  // Seed Rule
  await prisma.rule.createMany({
    data: rules.map(name => ({ name })),
    skipDuplicates: true,
  });
  console.log('Rules seeded');

  // Seed Stage
  await prisma.stage.createMany({
    data: stages.map(name => ({ name })),
    skipDuplicates: true,
  });
  console.log('Stages seeded');

  // Seed SubWeapon
  await prisma.subWeapon.createMany({
    data: subWeapons,
    skipDuplicates: true,
  });
  console.log('Sub weapons seeded');

  // Seed SpecialWeapon
  await prisma.specialWeapon.createMany({
    data: specialWeapons,
    skipDuplicates: true,
  });
  console.log('Special weapons seeded');

  // Seed Weapon
  await prisma.weapon.createMany({
    data: weapons,
    skipDuplicates: true,
  });
  console.log('Weapons seeded');

  console.log('Base master data seeding finished.');
}
