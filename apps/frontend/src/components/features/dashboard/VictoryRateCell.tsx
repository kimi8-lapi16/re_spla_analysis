import { Flex, Tooltip, Typography } from "antd";
import { Meter } from "../../base";
import { formatRatioAsPercent } from "../../../utils/number";

const { Text } = Typography;

/** Break-even: the reference line every win rate is really read against. */
const EVEN_RATE = 0.5;

/**
 * Below this, a rate swings too much per match to rank against the others
 * (3 wins in 4 games is 75%, and means very little), so the bar is drawn in a
 * lighter step of the same hue.
 */
const LOW_CONFIDENCE_THRESHOLD = 10;

interface VictoryRateCellProps {
  victoryRate: number;
  totalCount: number;
}

export function VictoryRateCell({ victoryRate, totalCount }: VictoryRateCellProps) {
  const isLowConfidence = totalCount < LOW_CONFIDENCE_THRESHOLD;
  const formatted = formatRatioAsPercent(victoryRate);

  const meter = (
    <Meter
      value={victoryRate}
      reference={EVEN_RATE}
      emphasis={isLowConfidence ? "muted" : "strong"}
      label={`勝率 ${formatted}`}
    />
  );

  return (
    <Flex align="center" gap="small">
      {isLowConfidence ? (
        <Tooltip title={`${totalCount} 試合のみのため参考値です`}>{meter}</Tooltip>
      ) : (
        meter
      )}
      <Text style={{ fontVariantNumeric: "tabular-nums", minWidth: 52, textAlign: "right" }}>
        {formatted}
      </Text>
    </Flex>
  );
}
