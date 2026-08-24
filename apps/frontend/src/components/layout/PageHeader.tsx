import { Flex, Typography } from "antd";
import type { ReactNode } from "react";

const { Title, Text } = Typography;

export interface PageHeaderProps {
  title: string;
  /** One line under the title explaining what the page is for. Optional. */
  description?: string;
  /** Buttons for this page, right-aligned on the title row. */
  actions?: ReactNode;
}

/**
 * The single page heading used by every page.
 *
 * Before this existed, four pages had four different treatments: `Title
 * level={2}`, `Title level={1}` inside a centered column, a raw `<h1>` with its
 * own `padding: 24px` that pushed the page 24px right of every other one, and
 * one page with no heading at all. Heading level, spacing and action placement
 * are decided here so that kind of drift cannot reappear.
 */
export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <Flex justify="space-between" align="flex-start" gap="middle" wrap>
      <Flex vertical gap={2}>
        <Title level={2} style={{ margin: 0 }}>
          {title}
        </Title>
        {description && <Text type="secondary">{description}</Text>}
      </Flex>
      {actions && (
        <Flex gap="small" wrap>
          {actions}
        </Flex>
      )}
    </Flex>
  );
}
