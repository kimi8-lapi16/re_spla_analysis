# デザインシステム

このドキュメントは「色をどこに書くか」「ボタンをどう選ぶか」を決めるものです。
ここに書かれたルールは ESLint で機械的に強制されています（[eslint.config.js](../../eslint.config.js)）。

## 大原則

**コンポーネントに色を書かない。**

過去に、カスタム Button が `backgroundColor` をインラインで書いていたことで次の3つが同時に壊れていました。

1. 呼び出し側が渡した `style` が variant 側のスプレッドに握り潰され、削除ボタンの赤が無効化されていた
2. インライン style が Ant Design の hover 用 CSS に必ず勝つため、全ボタンで hover / active が消えていた
3. 同じ理由で `disabled` も効かず、押せないボタンがブランド色のまま薄くなるだけだった

インラインの色指定はカスケードの最上位に居座り、ライブラリが用意した状態表現をすべて奪います。
だから色は下の3層のいずれかにしか書きません。

## 色の3層

```
colors.ts       パレット（どんな色が存在するか）
    ↓
semantic.ts     セマンティックトークン（その色が何を意味するか）  ← 色を書いてよいのはここまで
    ↓
antd-theme.ts   Ant Design のトークンへの割り当て
cssVariables.ts --app-* の CSS カスタムプロパティへの割り当て
    ↓
コンポーネント   トークンを参照するだけ
```

| 書きたいもの | 書く場所 |
| --- | --- |
| 新しい色そのもの | `colors.ts` |
| 「この色は何に使う色か」 | `semantic.ts` |
| antd コンポーネント全体の見た目 | `antd-theme.ts` |
| 素の CSS から使う色 | `semantic.ts` に足して `cssVariables.ts` で公開 |
| 個別コンポーネントの色 | **書かない**（上のどれかに足りない概念があるということ） |

`index.css` と `base.css` の色は `var(--app-*)` 経由です。CSS に直接パレットを転記すると
`colors.ts` と二重管理になって必ずズレるため、CSS 変数は `cssVariables.ts` から実行時に生成しています
（`main.tsx` が描画前に `applyThemeCssVariables()` を呼びます）。

## コントラスト方針

塗り面の上に白文字を乗せる場合、通常サイズのテキストは 4.5:1（WCAG 2.1 AA）が必要です。
パレットの **500 は塗り面には使いません**。

| | 比 | |
| --- | --- | --- |
| `primary[500]` #8b5cf6 + 白文字 | 4.22:1 | ✕ |
| `primary[600]` #7c3aed + 白文字 | 5.70:1 | ○ |
| `error[500]` #ef4444 + 白文字 | 3.76:1 | ✕ |
| `error[600]` #dc2626 + 白文字 | 4.83:1 | ○ |

運用ルール:

```
塗り = 600   hover = 700   active = 800   ボーダー = 300   淡い背景 = 50
白背景の上に置く文字 = 700 以上
```

`success` と `warning` は 600 でも白文字だと 4.5:1 に届きません
（`success[600]` 3.30:1 / `secondary[600]` 2.94:1）。塗りボタンには使わず、
テキストとして使う場合は `semantic.status.successText` / `warningText`（= 700）を参照してください。

## ボタン

`components/base` の `Button` は **`intent`** でトーンと強さを選びます。
色は antd がテーマから解決するので、`style` で色を指定する必要はありません（してはいけません）。

| | solid（強） | outlined（中） | text（弱） |
| --- | --- | --- | --- |
| ブランド | `primary` | — | — |
| ニュートラル | — | `neutral` | `quiet` |
| 破壊的 | `danger` | `dangerSubtle` | `dangerQuiet` |

```tsx
import { Button } from "../components/base";

<Button intent="primary" icon={<PlusOutlined />}>新規登録</Button>
<Button intent="neutral" onClick={onCancel}>キャンセル</Button>
<Button intent="dangerSubtle" icon={<DeleteOutlined />}>削除 (2)</Button>
```

使い分け:

- **`primary` は1画面に1つ。** そのページで一番やってほしいことだけ。
- **キャンセル・戻る・行を追加は `neutral`。** 以前これらが黄色（= `colorWarning`）になっており、
  「キャンセル」が保存ボタンより目立つ状態でした。黄色は Tag と Alert の色であって、ボタンの色ではありません。
- **削除は2段階。** 確認ダイアログを開くボタンが `dangerSubtle`（赤い枠線）、
  ダイアログの中で実際に削除するボタンが `danger`（赤の塗り）。強さがエスカレートしていくのが正しい形です。
- **`success` / `warning` の intent は用意していません。** 状態は Tag・Alert・Badge で表現します。

`intent` を省略した場合は `neutral` です。**一番おとなしいボタンが既定**であることに意図があります
（うっかり書いたボタンが画面で一番目立つ、という事故を構造的に防ぐため）。

一度きりの組み合わせが必要なときは antd の `color` / `variant` をそのまま渡せます。
プリセットより呼び出し側の指定が優先されます。

```tsx
<Button color="primary" variant="filled">薄い紫の塗り</Button>
```

## カード

`Card` の見た目は **`tone`** で選びます。

| tone | 見た目 | 用途 |
| --- | --- | --- |
| `plain`（既定） | 1px のボーダー | 通常のコンテンツ |
| `highlight` | 紫のボーダー＋淡い紫の背景 | 注目させたい領域 |
| `raised` | ボーダーなし＋影 | ログイン等、背景から浮かせたいもの |

`variant` ではなく `tone` という名前なのは、Ant Design v6 が `variant="outlined" | "borderless"` を
正式 API にしたためです。ライブラリの prop 名を別の意味で奪うと、そのライブラリの機能が永久に使えなくなります。
`Input` にラッパーが無いのも同じ理由です（旧実装は `variant` を潰していて `variant="filled"` が使えませんでした）。

## ページの骨格

### 見出し

ページ見出しは `components/layout/PageHeader` だけを使います。

```tsx
<PageHeader title="試合履歴" actions={<Button intent="primary">新規登録</Button>} />
<PageHeader title="試合データ登録" description="複数の試合を一度に登録できます。" />
```

以前は4ページで4通りでした（`Title level={2}` / 中央カラム内の `level={1}` /
自前 `padding: 24px` 付きの生の `<h1>`（他ページより24pxずれる）/ 見出しなし）。
見出しレベル・余白・アクションの位置をこの1箇所で決めることで、この種のズレが構造的に起きなくなります。

### 読み込み中

**レイアウトが決まっているものは `Skeleton`、決まっていないものだけ `Spin`。**

`Spin` でコンテンツ全体を包むと中身が65%まで薄くなり、文字が読めなくなります。
実際にログイン画面では、送信中にボタンのラベルも入力値も読めず、スピナーの
「ログイン中…」がパスワード欄に重なっていました。フォーム送信中はボタンの
`loading` だけで足ります（インジケータを2つ出さない）。

### 空状態

空状態は必ず **`Empty` ＋ 次の行動** をセットにします。テキスト1行で終わらせません。
「データが無い」のか「条件に一致しない」のかは別の状態なので、文言もボタンも分けます。

```tsx
// データが無い          → 「最初の試合を登録する」（primary）
// 条件に一致しない      → 「検索条件をクリア」（neutral）
```

## メーター（比率の表示）

`Meter` は「上限に対する1つの比率」を表す最小の目盛りです。チャートではありません
（1つの値のためにチャートを描くと、読む手間だけが増えます）。

```tsx
<Meter value={0.604} reference={0.5} emphasis="strong" label="勝率 60.4%" />
```

- **長さが比率、色相は1つだけ。** 順位を色で塗り分けると、フィルタで行が減ったときに
  同じ行の色が変わってしまいます。
- **`reference` は基準線。** 勝率なら 50%。「勝ち越しているか」を暗算させないためのものです。
- **`emphasis="muted"` は信頼度。** 長さがすでに比率を担っているので、明度は空いています。
  試合数が少なく参考にならない行を、同じ色相の淡いステップで描き分けます
  （4試合3勝の 75% が 91試合の 60% より上に並ぶ、という誤読を防ぐため）。
- **数値そのものは文字色のまま。** 値・ラベル・凡例に系列色を使わない、が原則です。

## 数値の書式

| 場面 | 書式 |
| --- | --- |
| 表の列（縦に揃える必要がある） | `font-variant-numeric: tabular-nums` |
| KPI カードの大きな数値 | 指定しない（プロポーショナル） |

`tabular-nums` は全桁を `0` と同じ幅にするため、大きな文字では `121` のような数値が
間延びして見えます。揃える必要がない場所では使いません。

## ESLint による強制

| ルール | 内容 | 例外 |
| --- | --- | --- |
| `no-restricted-syntax` | `#rrggbb` / `rgb()` / `rgba()` などの色リテラル禁止 | `colors.ts`, `semantic.ts` |
| `no-restricted-imports` | `antd` から直接 `Button` / `Card` / `Input` を import 禁止 | `components/base/` |

新しく色を書きたくなって ESLint に止められたら、それは
「`semantic.ts` にまだ名前が無い概念を使おうとしている」というサインです。
リテラルを書くのではなく、トークンを追加してください。

## ファイル構成

```
src/theme/
├── colors.ts          パレット（10段階 x 7系統）
├── semantic.ts        セマンティックトークン
├── antd-theme.ts      ConfigProvider に渡すテーマ
├── cssVariables.ts    --app-* の生成
├── index.ts
└── README.md          このファイル

src/components/base/
├── Button.tsx         intent プリセット
├── Card.tsx           tone プリセット
├── Meter.tsx          比率の目盛り
├── Input.tsx          antd Input の再エクスポート
├── base.css           tone と Meter のスタイル（--app-* のみ参照）
└── index.ts
```
