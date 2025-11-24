import { Layout } from 'antd';

const { Footer: AntFooter } = Layout;

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <AntFooter
      style={{
        textAlign: 'center',
        background: '#f0f2f5',
        borderTop: '1px solid #d9d9d9',
      }}
    >
      Splatoon Analysis ©{currentYear}
    </AntFooter>
  );
};
