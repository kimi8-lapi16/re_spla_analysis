import { Button as AntButton, type ButtonProps as AntButtonProps } from 'antd';
import { forwardRef } from 'react';
import { colors } from '../../theme';

export interface ButtonProps extends Omit<AntButtonProps, 'variant'> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'ghost' | 'text' | 'link';
}

/**
 * Custom Button component with theme colors
 * Extends Ant Design Button with custom variant styles
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', type, style, ...props }, ref) => {
    // Map custom variants to Ant Design types and styles
    const getButtonStyle = (): React.CSSProperties => {
      const baseStyle = style || {};

      switch (variant) {
        case 'primary':
          return {
            ...baseStyle,
            backgroundColor: colors.primary[500],
            borderColor: colors.primary[500],
          };

        case 'secondary':
          return {
            ...baseStyle,
            backgroundColor: colors.secondary[500],
            borderColor: colors.secondary[500],
            color: colors.text.primary,
          };

        case 'success':
          return {
            ...baseStyle,
            backgroundColor: colors.success[500],
            borderColor: colors.success[500],
          };

        case 'danger':
          return {
            ...baseStyle,
            backgroundColor: colors.error[500],
            borderColor: colors.error[500],
          };

        case 'warning':
          return {
            ...baseStyle,
            backgroundColor: colors.warning[500],
            borderColor: colors.warning[500],
          };

        case 'ghost':
          return baseStyle;

        case 'text':
          return baseStyle;

        case 'link':
          return {
            ...baseStyle,
            color: colors.primary[500],
          };

        default:
          return baseStyle;
      }
    };

    const getButtonType = (): AntButtonProps['type'] => {
      if (type) return type;

      switch (variant) {
        case 'ghost':
          return 'default';
        case 'text':
          return 'text';
        case 'link':
          return 'link';
        default:
          return 'primary';
      }
    };

    return (
      <AntButton
        ref={ref}
        type={getButtonType()}
        style={getButtonStyle()}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
