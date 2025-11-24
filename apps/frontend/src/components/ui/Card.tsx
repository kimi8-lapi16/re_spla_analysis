import { Card as AntCard, type CardProps as AntCardProps } from 'antd';
import { forwardRef } from 'react';
import { colors } from '../../theme';

export interface CardProps extends Omit<AntCardProps, 'variant'> {
  variant?: 'default' | 'bordered' | 'elevated';
}

/**
 * Custom Card component with theme colors
 * Extends Ant Design Card with custom variant styles
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', style, bordered, ...props }, ref) => {
    const getCardStyle = (): React.CSSProperties => {
      const baseStyle: React.CSSProperties = {
        borderRadius: 12,
        ...style,
      };

      switch (variant) {
        case 'default':
          return {
            ...baseStyle,
            border: `1px solid ${colors.neutral[200]}`,
          };

        case 'bordered':
          return {
            ...baseStyle,
            border: `2px solid ${colors.primary[200]}`,
            backgroundColor: colors.primary[50],
          };

        case 'elevated':
          return {
            ...baseStyle,
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            border: 'none',
          };

        default:
          return baseStyle;
      }
    };

    return (
      <AntCard
        ref={ref}
        bordered={variant !== 'elevated'}
        style={getCardStyle()}
        {...props}
      />
    );
  }
);

Card.displayName = 'Card';
