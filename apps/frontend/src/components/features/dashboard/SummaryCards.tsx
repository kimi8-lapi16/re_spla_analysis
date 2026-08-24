import { Col, Flex, Row, Skeleton, Typography } from "antd";
import { Card } from "../../base";
import { useRules } from "../../../hooks/useRule";
import { RECENT_MATCH_COUNT, useDashboardSummary } from "../../../hooks/useDashboardSummary";
import { formatRatioAsPercent, formatRatioDeltaAsPoints } from "../../../utils/number";

const { Text } = Typography;

const EMPTY_VALUE = "—";

interface StatTileProps {
  label: string;
  value: string;
  /** One short line under the value: what the number is measured against. */
  context?: string;
  /** Colors the context line by direction. The sign carries it too, never color alone. */
  contextTone?: "neutral" | "up" | "down";
}

/**
 * Label, value, optional context line.
 *
 * The value uses the font's proportional figures, not `tabular-nums`: tabular
 * gives every digit the width of a zero, which looks loose at display sizes.
 * Tabular is for columns of numbers that must line up, i.e. the tables.
 */
function StatTile({ label, value, context, contextTone = "neutral" }: StatTileProps) {
  const contextType =
    contextTone === "up" ? "success" : contextTone === "down" ? "danger" : "secondary";

  return (
    <Card size="small">
      <Flex vertical gap={2}>
        <Text type="secondary" style={{ fontSize: 13 }}>
          {label}
        </Text>
        <Text style={{ fontSize: 28, fontWeight: 600, lineHeight: 1.2 }}>{value}</Text>
        <Text type={contextType} style={{ fontSize: 12 }}>
          {context ?? " "}
        </Text>
      </Flex>
    </Card>
  );
}

export function SummaryCards() {
  const { data, isLoading } = useDashboardSummary();
  const { data: rules } = useRules();

  if (isLoading || !data) {
    return (
      <Row gutter={[16, 16]}>
        {[0, 1, 2, 3].map((index) => (
          <Col key={index} xs={24} sm={12} xl={6}>
            <Card size="small">
              <Skeleton active paragraph={{ rows: 1 }} title={{ width: "60%" }} />
            </Card>
          </Col>
        ))}
      </Row>
    );
  }

  const { totalCount, winCount, overallVictoryRate, recentVictoryRate, recentSampleSize } = data;

  const formDiff =
    recentVictoryRate !== null && overallVictoryRate !== null
      ? recentVictoryRate - overallVictoryRate
      : null;
  const formDelta = formDiff === null ? null : formatRatioDeltaAsPoints(formDiff);

  const latestPointRuleName =
    data.latestPointRuleId !== null
      ? rules?.find((rule) => rule.id === data.latestPointRuleId)?.name
      : undefined;

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={12} xl={6}>
        <StatTile
          label="総試合数"
          value={totalCount.toLocaleString("ja-JP")}
          context="登録済みの全試合"
        />
      </Col>
      <Col xs={24} sm={12} xl={6}>
        <StatTile
          label="全体勝率"
          value={
            overallVictoryRate === null ? EMPTY_VALUE : formatRatioAsPercent(overallVictoryRate)
          }
          context={
            overallVictoryRate === null ? undefined : `${winCount} 勝 ${totalCount - winCount} 敗`
          }
        />
      </Col>
      <Col xs={24} sm={12} xl={6}>
        <StatTile
          label={`直近${RECENT_MATCH_COUNT}戦の勝率`}
          value={recentVictoryRate === null ? EMPTY_VALUE : formatRatioAsPercent(recentVictoryRate)}
          context={
            recentSampleSize < RECENT_MATCH_COUNT
              ? `${recentSampleSize} 試合のみ`
              : formDelta
                ? `全体比 ${formDelta}`
                : undefined
          }
          contextTone={
            recentSampleSize < RECENT_MATCH_COUNT || formDiff === null || formDiff === 0
              ? "neutral"
              : formDiff > 0
                ? "up"
                : "down"
          }
        />
      </Col>
      <Col xs={24} sm={12} xl={6}>
        <StatTile
          label="直近のポイント"
          value={data.latestPoint === null ? EMPTY_VALUE : data.latestPoint.toLocaleString("ja-JP")}
          context={latestPointRuleName ? `${latestPointRuleName}（最新の記録）` : undefined}
        />
      </Col>
    </Row>
  );
}
