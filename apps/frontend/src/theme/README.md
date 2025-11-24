# テーマシステム - 使用ガイド

このドキュメントでは、Splatoon Analysisアプリケーションのテーマシステムの使用方法について説明します。

## カラーパレット

### プライマリーカラー (紫)
メインのブランドカラーとして使用されます。

```typescript
import { colors } from '../theme';

// 使用例
const primaryColor = colors.primary[500]; // #8b5cf6
const lightPrimary = colors.primary[100]; // #ede9fe
const darkPrimary = colors.primary[700]; // #6d28d9
```

### セカンダリーカラー (黄色)
アクセントカラーとして使用されます。

```typescript
const secondaryColor = colors.secondary[500]; // #eab308
const lightSecondary = colors.secondary[100]; // #fef9c3
const darkSecondary = colors.secondary[700]; // #a16207
```

### セマンティックカラー

- **Success (成功)**: `colors.success[500]` - #22c55e (緑)
- **Error (エラー)**: `colors.error[500]` - #ef4444 (赤)
- **Warning (警告)**: `colors.warning[500]` - #f97316 (オレンジ)
- **Info (情報)**: `colors.info[500]` - #3b82f6 (青)

### ニュートラルカラー

グレースケールのカラーパレット:

```typescript
colors.neutral[50]  // #fafafa (最も明るい)
colors.neutral[500] // #737373 (中間)
colors.neutral[900] // #171717 (最も暗い)
```

### 背景とテキスト

```typescript
// 背景色
colors.background.light  // #ffffff
colors.background.gray   // #f9fafb
colors.background.dark   // #0f0f0f

// テキスト色
colors.text.primary      // #171717
colors.text.secondary    // #525252
colors.text.tertiary     // #a3a3a3
colors.text.inverse      // #ffffff
```

## カスタムコンポーネント

### Button コンポーネント

Ant DesignのButtonを拡張したカスタムボタンコンポーネントです。

```typescript
import { Button } from '../components/ui';

// Primary (紫)
<Button variant="primary">Primary Button</Button>

// Secondary (黄色)
<Button variant="secondary">Secondary Button</Button>

// Success (緑)
<Button variant="success">Success Button</Button>

// Danger (赤)
<Button variant="danger">Delete</Button>

// Warning (オレンジ)
<Button variant="warning">Warning</Button>

// Ghost (透明背景)
<Button variant="ghost">Ghost Button</Button>

// Text (テキストのみ)
<Button variant="text">Text Button</Button>

// Link (リンクスタイル)
<Button variant="link">Link Button</Button>
```

すべてのAnt Design Buttonのプロパティが使用可能です:

```typescript
<Button
  variant="primary"
  size="large"
  block
  loading={isPending}
  icon={<SaveOutlined />}
>
  保存
</Button>
```

### Card コンポーネント

カスタムスタイルが適用されたCardコンポーネントです。

```typescript
import { Card } from '../components/ui';

// Default (標準のボーダー)
<Card variant="default" title="Default Card">
  コンテンツ
</Card>

// Bordered (紫のボーダー、薄紫の背景)
<Card variant="bordered" title="Bordered Card">
  強調されたコンテンツ
</Card>

// Elevated (影付き、ボーダーなし)
<Card variant="elevated" title="Elevated Card">
  浮き上がったコンテンツ
</Card>
```

すべてのAnt Design Cardのプロパティが使用可能です。

### Input コンポーネント

カスタムスタイルが適用されたInputコンポーネントです。

```typescript
import { Input } from '../components/ui';

// 標準のInput
<Input
  placeholder="メールアドレス"
  prefix={<UserOutlined />}
  size="large"
/>

// Password Input
<Input.Password
  placeholder="パスワード"
  prefix={<LockOutlined />}
  size="large"
/>

// カスタムフィルドバリアント (グレー背景、ボーダーなし)
<Input
  customVariant="custom-filled"
  placeholder="検索..."
/>
```

すべてのAnt Design Inputのプロパティが使用可能です。

## Ant Design ConfigProvider

アプリケーション全体のAnt Designコンポーネントにテーマが適用されています ([main.tsx:18](../../main.tsx#L18))。

```typescript
import { ConfigProvider } from 'antd';
import { antdTheme } from './theme';

<ConfigProvider theme={antdTheme}>
  {/* アプリケーション */}
</ConfigProvider>
```

これにより、以下のコンポーネントが自動的にテーマカラーを使用します:
- Button (標準の`type="primary"`は紫色になります)
- Input (フォーカス時のボーダーが紫色)
- Form (バリデーションカラーなど)
- Notification (通知メッセージ)
- Modal, Drawer, Tooltip など

## CSS変数

[index.css](../../index.css)でCSS変数も定義されています:

```css
/* 使用例 */
.custom-element {
  color: var(--color-primary-500);
  background-color: var(--color-bg-light);
  border-color: var(--color-neutral-200);
}

/* リンクのスタイル */
a {
  color: var(--color-primary-500);
}

a:hover {
  color: var(--color-primary-600);
}
```

## 使用例

### ログインページ

[LoginPage.tsx](../../pages/LoginPage.tsx)では、以下のようにカスタムコンポーネントを使用しています:

```typescript
import { Button, Card, Input } from '../components/ui';

<Card title="ログイン" variant="elevated" style={{ width: 400 }}>
  <Input
    prefix={<UserOutlined />}
    placeholder="メールアドレス"
    size="large"
  />

  <Input.Password
    prefix={<LockOutlined />}
    placeholder="パスワード"
    size="large"
  />

  <Button
    variant="primary"
    htmlType="submit"
    size="large"
    block
    loading={isPending}
  >
    ログイン
  </Button>
</Card>
```

### ヘッダー

[Header.tsx](../../components/Header.tsx)では、グラデーション背景を使用しています:

```typescript
import { colors } from '../theme';

<AntHeader
  style={{
    background: `linear-gradient(135deg, ${colors.primary[700]} 0%, ${colors.primary[600]} 100%)`,
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
  }}
>
  <div style={{ color: colors.text.inverse }}>
    Splatoon Analysis
  </div>
</AntHeader>
```

## ベストプラクティス

1. **一貫性を保つ**: 常にテーマで定義された色を使用してください
2. **セマンティックカラーを使用**: 成功は緑、エラーは赤など、意味に応じた色を選択
3. **コントラストに注意**: テキストと背景の色のコントラストを確保
4. **カスタムコンポーネントを優先**: 直接Ant Designコンポーネントを使用するのではなく、カスタムコンポーネントを使用
5. **CSS変数の活用**: プレーンCSSを書く場合は、CSS変数を使用

## ファイル構成

```
src/theme/
├── colors.ts          # カラーパレット定義
├── antd-theme.ts      # Ant Designテーマ設定
├── index.ts           # エクスポート
└── README.md          # このファイル

src/components/ui/
├── Button.tsx         # カスタムButtonコンポーネント
├── Card.tsx           # カスタムCardコンポーネント
├── Input.tsx          # カスタムInputコンポーネント
└── index.ts           # エクスポート
```

## 今後の拡張

新しいコンポーネントやバリアントを追加する場合:

1. `colors.ts`に必要な色を追加
2. `antd-theme.ts`でAnt Designのトークンを更新
3. 必要に応じて`components/ui/`に新しいカスタムコンポーネントを作成
4. `components/ui/index.ts`でエクスポート

例:
```typescript
// components/ui/Badge.tsx
import { Badge as AntBadge } from 'antd';
import { colors } from '../../theme';

export const Badge = ({ color, ...props }) => (
  <AntBadge color={colors.primary[500]} {...props} />
);
```
