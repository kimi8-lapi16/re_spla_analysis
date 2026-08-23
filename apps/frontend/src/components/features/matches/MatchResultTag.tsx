import { Tag } from "antd";

interface MatchResultTagProps {
  result: string;
}

/**
 * Win / loss as a tag rather than plain text.
 *
 * Only the win is colored: in a list where most rows are one or the other, a
 * colored chip on both sides is just noise. The label carries the meaning, so
 * this never depends on color alone.
 */
export function MatchResultTag({ result }: MatchResultTagProps) {
  if (result === "WIN") {
    return <Tag color="success">勝ち</Tag>;
  }
  return <Tag>負け</Tag>;
}
