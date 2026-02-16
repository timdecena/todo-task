import { Button, Space, Typography } from 'antd';
import { BRANDING } from '../../config/branding';

const { Title, Text } = Typography;

type FinalCTASectionProps = {
  onGetStarted: () => void;
};

/**
 * Final call-to-action band.
 */
const FinalCTASection = ({ onGetStarted }: FinalCTASectionProps) => {
  return (
    <section aria-label="Get started call to action" style={{ padding: '8px 20px 60px' }}>
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          background: BRANDING.primaryColor,
          borderRadius: 20,
          padding: '34px 28px',
          color: '#fff',
        }}
      >
        <Space
          direction="vertical"
          size={14}
          style={{ width: '100%', textAlign: 'center', alignItems: 'center' }}
        >
          <Title level={2} style={{ margin: 0, color: '#fff' }}>
            Ready to make task management easy?
          </Title>
          <Text style={{ color: '#fff' }}>
            Start with Sug Done and keep your team focused on what matters every day.
          </Text>
          <Button size="large" onClick={onGetStarted} aria-label="Open Sug Done task app">
            Get Started
          </Button>
        </Space>
      </div>
    </section>
  );
};

export default FinalCTASection;

