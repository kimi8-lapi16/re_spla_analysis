import { Input as AntInput, type InputProps as AntInputProps, type InputRef } from 'antd';
import { forwardRef } from 'react';
import { colors } from '../../theme';

export interface InputProps extends Omit<AntInputProps, 'variant'> {
  customVariant?: 'default' | 'custom-filled';
}

/**
 * Custom Input component with theme colors
 * Extends Ant Design Input with custom variant styles
 */
export const Input = forwardRef<InputRef, InputProps>(
  ({ customVariant = 'default', style, ...props }, ref) => {
    const getInputStyle = (): React.CSSProperties => {
      const baseStyle: React.CSSProperties = {
        ...style,
      };

      switch (customVariant) {
        case 'custom-filled':
          return {
            ...baseStyle,
            backgroundColor: colors.neutral[50],
            borderColor: 'transparent',
          };

        default:
          return baseStyle;
      }
    };

    return <AntInput ref={ref} style={getInputStyle()} {...props} />;
  }
);

Input.displayName = 'Input';

// Password Input
export interface PasswordInputProps extends Omit<AntInputProps, 'variant'> {
  customVariant?: 'default' | 'custom-filled';
}

const PasswordInputComponent = forwardRef<InputRef, PasswordInputProps>(
  ({ customVariant = 'default', style, ...props }, ref) => {
    const getInputStyle = (): React.CSSProperties => {
      const baseStyle: React.CSSProperties = {
        ...style,
      };

      switch (customVariant) {
        case 'custom-filled':
          return {
            ...baseStyle,
            backgroundColor: colors.neutral[50],
            borderColor: 'transparent',
          };

        default:
          return baseStyle;
      }
    };

    return <AntInput.Password ref={ref} style={getInputStyle()} {...props} />;
  }
);

PasswordInputComponent.displayName = 'PasswordInput';

// Export with proper typing
export const PasswordInput = PasswordInputComponent;

// Create a compound component structure
type InputComponent = typeof Input & {
  Password: typeof PasswordInputComponent;
};

// Attach Password component to Input
(Input as InputComponent).Password = PasswordInputComponent;

// Export the compound component
export default Input as InputComponent;
