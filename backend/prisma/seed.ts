import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createRules() {
  return await prisma.rule.createMany({
data: [
  { name: 'ガチエリア' },
  { name: 'ガチヤグラ' },
  { name: 'ガチホコバトル' },
  { name: 'ガチアサリ' },
],
skipDuplicates: true,
  })
}

async function createStages() {
  return await prisma.stage.createMany({
data: [
  { name: "ユノハナ大渓谷" },
  { name: "ゴンズイ地区" },
  { name: "ヤガラ市場" },
  { name: "マテガイ放水路" },
  { name: "ナメロウ金属" },
  { name: "マサバ海峡大橋" },
  { name: "キンメダイ美術館" },
  { name: "マヒマヒリゾート&スパ" },
  { name: "海女美術大学" },
  { name: "チョウザメ造船" },
  { name: "ザトウマーケット" },
  { name: "スメーシーワールド" },
  { name: "クサヤ温泉" },
  { name: "ヒラメが丘団地" },
  { name: "ナンプラー遺跡" },
  { name: "マンタマリア号" },
  { name: "オヒョウ海運" },
  { name: "タカアシ経済特区" },
  { name: "バイガイ亭" },
  { name: "ネギトロ炭鉱" },
  { name: "カジキ空港" },
  { name: "リュウグウターミナル"}
]
  })
}

async function createWeapons() {
  return await prisma.weapon.createMany({
    data: [
      {
        main: "わかばシューター",
        sub: "スプラッシュボム",
        special: "グレートバリア",
      },
      {
        main: "スプラシューター",
        sub: "キューバンボム",
        special: "ウルトラショット",
      },
      {
        main: "プロモデラーMG",
        sub: "タンサンボム",
        special: "サメライド",
      },
      {
        main: "N-ZAP85",
        sub: "キューバンボム",
        special: "エナジースタンド",
      },
      {
        main: "もみじシューター",
        sub: "トーピード",
        special: "ホップソナー",
      },
      {
        main: "ボールドマーカー",
        sub: "カーリングボム",
        special: "ウルトラハンコ",
      },
      {
        main: "スペースシューター",
        sub: "ポイントセンサー",
        special: "メガホンレーザー",
      },
      {
        main: "プライムシューター",
        sub: "ラインマーカー",
        special: "カニタンク",
      },
      {
        main: "52ガロン",
        sub: "スプラッシュシールド",
        special: "メガホンレーザー",
      },
      {
        main: "N-ZAP89",
        sub: "ロボットボム",
        special: "デコイチラシ",
      },
      {
        main: "スペースシューターコラボ",
        sub: "トラップ",
        special: "ジェットパック",
      },
      {
        main: "L3リールガン",
        sub: "カーリングボム",
        special: "カニタンク",
      },
      {
        main: "ボールドマーカーネオ",
        sub: "ジャンプビーコン",
        special: "メガホンレーザー",
      },
      {
        main: "ジェットスイーパー",
        sub: "ラインマーカー",
        special: "キューインキ",
      },
      {
        main: "シャープマーカー",
        sub: "クイックボム",
        special: "カニタンク",
      },
      {
        main: "96ガロン",
        sub: "スプリンクラー",
        special: "キューインキ",
      },
      {
        main: "プロモデラーRG",
        sub: "スプリンクラー",
        special: "ナイスダマ",
      },
      {
        main: "L3リールガンD",
        sub: "クイックボム",
        special: "ウルトラハンコ",
      },
      {
        main: "ボトルガイザー",
        sub: "スプラッシュシールド",
        special: "ウルトラショット",
      },
      {
        main: "ジェットスイーパーカスタム",
        sub: "ポイズンミスト",
        special: "アメフラシ",
      },
      {
        main: "プライムシューターコラボ",
        sub: "キューバンボム",
        special: "ナイスダマ",
      },
      {
        main: "シャープマーカーネオ",
        sub: "キューバンボム",
        special: "トリプルトルネード",
      },
      {
        main: "96ガロンデコ",
        sub: "スプラッシュシールド",
        special: "テイオウイカ",
      },
      {
        main: "H3リールガン",
        sub: "ポイントセンサー",
        special: "エナジースタンド",
      },
      {
        main: "H3リールガンD",
        sub: "スプラッシュシールド",
        special: "グレートバリア",
      },
      {
        main: "ヒーローシューターレプリカ",
        sub: "キューバンボム",
        special: "ウルトラショット",
      },
      {
        main: "スプラローラー",
        sub: "カーリングボム",
        special: "グレートバリア",
      },
      {
        main: "カーボンローラー",
        sub: "ロボットボム",
        special: "ショクワンダー",
      },
      {
        main: "スプラローラーコラボ",
        sub: "ジャンプビーコン",
        special: "テイオウイカ",
      },
      {
        main: "ダイナモローラー",
        sub: "スプリンクラー",
        special: "エナジースタンド",
      },
      {
        main: "ワイドローラー",
        sub: "スプラッシュシールド",
        special: "キューインキ",
      },
      {
        main: "ワイドローラーコラボ",
        sub: "ラインマーカー",
        special: "アメフラシ",
      },
      {
        main: "ヴァリアブルローラー",
        sub: "トラップ",
        special: "マルチミサイル",
      },
      {
        main: "カーボンローラーデコ",
        sub: "クイックボム",
        special: "ウルトラショット",
      },
      {
        main: "スプラチャージャー",
        sub: "スプラッシュボム",
        special: "キューインキ",
      },
      {
        main: "スクイックリンα",
        sub: "ポイントセンサー",
        special: "グレートバリア",
      },
      {
        main: "スプラチャージャーコラボ",
        sub: "スプラッシュシールド",
        special: "トリプルトルネード",
      },
      {
        main: "スプラスコープ",
        sub: "スプラッシュボム",
        special: "キューインキ",
      },
      {
        main: "R-PEN/5H",
        sub: "スプリンクラー",
        special: "エナジースタンド",
      },
      {
        main: "リッター4K",
        sub: "トラップ",
        special: "ホップソナー",
      },
      {
        main: "スプラスコープコラボ",
        sub: "スプラッシュシールド",
        special: "トリプルトルネード",
      },
      {
        main: "14式竹筒銃・甲",
        sub: "ロボットボム",
        special: "メガホンレーザー",
      },
      {
        main: "ソイチューバー",
        sub: "トーピード",
        special: "マルチミサイル",
      },
      {
        main: "4Kスコープ",
        sub: "トラップ",
        special: "ホップソナー",
      },
      {
        main: "バケットスロッシャー",
        sub: "スプラッシュボム",
        special: "トリプルトルネード",
      },
      {
        main: "ヒッセン",
        sub: "ポイズンミスト",
        special: "ジェットパック",
      },
      {
        main: "バケットスロッシャーデコ",
        sub: "ラインマーカー",
        special: "ショクワンダー",
      },
      {
        main: "スクリュースロッシャー",
        sub: "タンサンボム",
        special: "ナイスダマ",
      },
      {
        main: "ヒッセンヒュー",
        sub: "タンサンボム",
        special: "エナジースタンド",
      },
      {
        main: "オーバーフロッシャー",
        sub: "スプリンクラー",
        special: "アメフラシ",
      },
      {
        main: "エクスプロッシャー",
        sub: "ポイントセンサー",
        special: "アメフラシ",
      },
      {
        main: "バレルスピナー",
        sub: "スプリンクラー",
        special: "ホップソナー",
      },
      {
        main: "スプラスピナー",
        sub: "クイックボム",
        special: "ウルトラハンコ",
      },
      {
        main: "バレルスピナーデコ",
        sub: "ポイントセンサー",
        special: "テイオウイカ",
      },
      {
        main: "ハイドラント",
        sub: "ロボットボム",
        special: "ナイスダマ",
      },
      {
        main: "スプラスピナーコラボ",
        sub: "ポイズンミスト",
        special: "グレードバリア",
      },
      {
        main: "ノーチラス47",
        sub: "ポイントセンサー",
        special: "アメフラシ",
      },
      {
        main: "クーゲルシュライバー",
        sub: "タンサンボム",
        special: "ジェットパック",
      },
      {
        main: "スプラマニューバー",
        sub: "キューバンボム",
        special: "カニタンク",
      },
      {
        main: "デュアルスイーパー",
        sub: "スプラッシュボム",
        special: "ホップソナー",
      },
      {
        main: "スパッタリー",
        sub: "ジャンプビーコン",
        special: "エナジースタンド",
      },
      {
        main: "デュアルスイーパーカスタム",
        sub: "ジャンプビーコン",
        special: "デコイチラシ",
      },
      {
        main: "クアッドホッパーブラック",
        sub: "ロボットボム",
        special: "サメライド",
      },
      {
        main: "ケルビン525",
        sub: "スプラッシュシールド",
        special: "ナイスダマ",
      },
      {
        main: "クアッドホッパーホワイト",
        sub: "スプリンクラー",
        special: "ショクワンダー",
      },
      {
        main: "スパッタリーヒュー",
        sub: "トーピード",
        special: "サメライド",
      },
      {
        main: "パラシェルター",
        sub: "スプリンクラー",
        special: "トリプルトルネード",
      },
      {
        main: "キャンピングシェルター",
        sub: "ジャンプビーコン",
        special: "キューインキ",
      },
      {
        main: "スパイガジェット",
        sub: "トラップ",
        special: "サメライド",
      },
      {
        main: "キャンピングシェルターソレーラ",
        sub: "トラップ",
        special: "ウルトラショット",
      },
      {
        main: "ホットブラスター",
        sub: "ロボットボム",
        special: "グレートバリア",
      },
      {
        main: "ラピッドブラスター",
        sub: "トラップ",
        special: "トリプルトルネード",
      },
      {
        main: "ラピッドブラスターデコ",
        sub: "トーピード",
        special: "ジェットパック",
      },
      {
        main: "ロングブラスター",
        sub: "キューバンボム",
        special: "ホップソナー",
      },
      {
        main: "ノヴァブラスター",
        sub: "スプラッシュボム",
        special: "ショクワンダー",
      },
      {
        main: "S-BLAST92",
        sub: "スプリンクラー",
        special: "サメライド",
      },
      {
        main: "クラッシュブラスター",
        sub: "スプラッシュボム",
        special: "ウルトラショット",
      },
      {
        main: "ノヴァブラスターネオ",
        sub: "タンサンボム",
        special: "ウルトラハンコ",
      },
      {
        main: "クラッシュブラスターネオ",
        sub: "カーリングボム",
        special: "デコイチラシ",
      },
      {
        main: "Rブラスターエリート",
        sub: "ポイズンミスト",
        special: "キューインキ",
      },
      {
        main: "Rブラスターエリートデコ",
        sub: "ラインマーカー",
        special: "メガホンレーザー",
      },
      {
        main: "ホクサイ",
        sub: "キューバンボム",
        special: "ショクワンダー",
      },
      {
        main: "パブロ",
        sub: "スプラッシュボム",
        special: "メガホンレーザー",
      },
      {
        main: "フィンセント",
        sub: "カーリングボム",
        special: "ホップソナー",
      },
      {
        main: "パブロヒュー",
        sub: "トラップ",
        special: "ウルトラハンコ",
      },
      {
        main: "トライストリンガー",
        sub: "ポイズンミスト",
        special: "メガホンレーザー",
      },
      {
        main: "LACT-450",
        sub: "カーリングボム",
        special: "マルチミサイル",
      },
      {
        main: "ドライブワイパー",
        sub: "トーピード",
        special: "ウルトラハンコ",
      },
      {
        main: "ドライブワイパーデコ",
        sub: "ジャンプビーコン",
        special: "マルチミサイル",
      },
      {
        main: "ジムワイパー",
        sub: "クイックボム",
        special: "ショクワンダー",
      },
      {
        main: "モップリン",
        sub: "キューバンボム",
        special: "サメライド",
      },
      {
        main: "イグザミナー",
        sub: "カーリングボム",
        special: "エナジースタンド",
      },
      {
        main: "ダイナモローラーテスラ",
        sub: "スプラッシュボム",
        special: "デコイチラシ",
      },
      {
        main: "ホクサイ・ヒュー",
        sub: "ジャンプビーコン",
        special: "アメフラシ",
      },
      {
        main: "ソイチューバーカスタム",
        sub: "タンサンボム",
        special: "ウルトラハンコ",
      },
      {
        main: "スクリュースロッシャー",
        sub: "ポイントセンサー",
        special: "ウルトラショット",
      },
      {
        main: "オーバーフロッシャーデコ",
        sub: "ラインマーカー",
        special: "テイオウイカ",
      },
      {
        main: "クーゲルシュライバー・ヒュー",
        sub: "トラップ",
        special: "キューインキ",
      },
      {
        main: "パラシェルターソレーラ",
        sub: "ロボットボム",
        special: "ジェットパック",
      },
      {
        main: "トライストリンガーコラボ",
        sub: "スプリンクラー",
        special: "デコイチラシ",
      },
      {
        main: "R-PEN/5B",
        sub: "スプラッシュシールド",
        special: "アメフラシ",
      },
      {
        main: "フィンセント・ヒュー",
        sub: "ポイントセンサー",
        special: "マルチミサイル",
      },
      {
        main: "ボトルガイザーフォイル",
        sub: "ロボットボム",
        special: "スミナガシート",
      },
      {
        main: "スパイガジェットソレーラ",
        sub: "トーピード",
        special: "スミナガシート",
      },
      {
        main: "LACT-450デコ",
        sub: "スプラッシュシールド",
        special: "サメライド",
      },
      {
        main: "S-BLAST91",
        sub: "クイックボム",
        special: "ナイスダマ",
      },
      {
        main: "ジムワイバー・ヒュー",
        sub: "ポイズンミスト",
        special: "カニタンク",
      },
      {
        main: "スプラマニューバーコラボ",
        sub: "カーリングボム",
        special: "ウルトラチャクチ",
      },
      {
        main: "ホットブラスターカスタム",
        sub: "ポイントセンサー",
        special: "ウルトラチャクチ",
      },
      {
        main: "24式張替傘・甲",
        sub: "ラインマーカー",
        special: "グレートバリア",
      },
      {
        main: "ガエンFF",
        sub: "トラップ",
        special: "メガホンレーザー",
      },
      {
        main: ".52ガロンデコ",
        sub: "カーリングボム",
        special: "スミナガシート",
      },
      {
        main: "ケルビン525デコ",
        sub: "ポイントセンサー",
        special: "ウルトラショット",
      },
      {
        main: "スクイックリンβ",
        sub: "ロボットボム",
        special: "ショクワンダー",
      },
      {
        main: "モップリンD",
        sub: "ジャンプビーコン",
        special: "ホッピングソナー",
      },
      {
        main: "ヴァリアブルローラーフォイル",
        sub: "キューバンボム",
        special: "スミナガシート",
      },
      {
        main: "ノーチラス79",
        sub: "キューバンボム",
        special: "ウルトラチャクチ",
      },
      {
        main: "リッター4Kカスタム",
        sub: "ジャンプビーコン",
        special: "テイオウイカ",
      },
      {
        main: "4Kスコープカスタム",
        sub: "ジャンプビーコン",
        special: "テイオウイカ",
      },
      {
        main: "エクスプロッシャーカスタム",
        sub: "スプラッシュシールド",
        special: "ウルトラチャクチ",
      },
      {
        main: "オーダーマニューバーレプリカ",
        sub: "キューバンボム",
        special: "カニタンク",
      },
      {
        main: "オーダーシェルターレプリカ",
        sub: "スプリンクラー",
        special: "トリプルトルネード",
      },
      {
        main: "オーダーシューターレプリカ",
        sub: "キューバンボム",
        special: "ウルトラショット",
      },
      {
        main: "オーダーローラーレプリカ",
        sub: "カーリングボム",
        special: "グレートバリア",
      },
      {
        main: "オーダーチャージャーレプリカ",
        sub: "スプラッシュボム",
        special: "キューインキ",
      },
      {
        main: "オーダーストリンガーレプリカ",
        sub: "ポイズンミスト",
        special: "メガホンレーザー5.1ch",
      },
      {
        main: "オーダーワイパーレプリカ",
        sub: "クイックボム",
        special: "ショクワンダー",
      },
      {
        main: "オーダースロッシャーレプリカ",
        sub: "スプラッシュボム",
        special: "トリプルトルネード",
      },
      {
        main: "オーダーブラスターレプリカ",
        sub: "スプラッシュボム",
        special: "ショクワンダー",
      },
      {
        main: "オーダーブラシレプリカ",
        sub: "キューバンボム",
        special: "ショクワンダー",
      },
      {
        main: "オーダースピナーレプリカ",
        sub: "スプリンクラー",
        special: "ホップソナー",
      },
      {
        main: "オクタシューターレプリカ",
        sub: "スプラッシュボム",
        special: "トリプルトルネード",
      },
      {
        main: "ロングブラスターカスタム",
        sub: "スプラッシュボム",
        special: "テイオウイカ",
      },
      {
        main: "14式竹筒・乙",
        sub: "タンサンボム",
        special: "デコイチラシ",
      },
      {
        main: "ハイドラントカスタム",
        sub: "トラップ",
        special: "スミナガシート",
      },
      {
        main: "イグザミナー・ヒュー",
        sub: "スプラッシュボム",
        special: "カニタンク",
      },
      {
        main: "ガエンFFカスタム",
        sub: "クイックボム",
        special: "トリプルトルネード",
      },
      {
        main: "24式張替傘・乙",
        sub: "ポイズンミスト",
        special: "ウルトラチャクチ",
      },
      {
        main: "フルイドV",
        sub: "ロボットボム",
        special: "ウルトラハンコ",
      },
      {
        main: "フルイドVカスタム",
        sub: "ポイントセンサー",
        special: "ホップソナー",
      },
      {
        main: "デンタルワイパーミント",
        sub: "キューバンボム",
        special: "グレートバリア",
      },
      {
        main: "デンタルワイパースミ",
        sub: "スプラッシュシールド",
        special: "ジェットパック",
      }
    ]
  })
}

// NOTE: npm run seedで以下のエラーが表示されてた場合、npx prisma migrate devを叩く
// The table `public.Purpose` does not exist in the current database.
async function main() {
  await Promise.all([createRules(), createStages(), createWeapons()]);
}

main()
  .catch((e) => {
console.error(e);
  })
  .finally(async () => {
await prisma.$disconnect();
  });
