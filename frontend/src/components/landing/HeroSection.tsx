import { Button, Card, Col, Progress, Row, Skeleton, Space, Tag, Typography } from 'antd';
import { ArrowRightOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { BRANDING } from '../../config/branding';

const { Title, Paragraph, Text } = Typography;

type HeroSectionProps = {
  onGetStarted: () => void;
  onViewDemo: () => void;
};

/**
 * Main hero section with CTAs and mock product preview card.
 */
const HeroSection = ({ onGetStarted, onViewDemo }: HeroSectionProps) => {
  return (
    <section
      aria-labelledby="hero-title"
      style={{
        padding: '72px 20px 56px',
        background:
          'radial-gradient(circle at 20% 10%, rgba(209,35,42,0.12), transparent 38%), linear-gradient(180deg, #ffffff 0%, #fff9f9 100%)',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <Row gutter={[40, 36]} align="middle">
          <Col xs={24} lg={13}>
            <Space direction="vertical" size={18} style={{ width: '100%' }}>
              <Tag color="red" style={{ width: 'fit-content', marginInlineEnd: 0 }}>
                Smart productivity made simple
              </Tag>
              <Title id="hero-title" style={{ margin: 0, lineHeight: 1.15 }}>
                {BRANDING.heroHeadline}
              </Title>
              <Paragraph style={{ margin: 0, fontSize: 18, color: '#595959', maxWidth: 620 }}>
                {BRANDING.heroSubtitle}
              </Paragraph>
              <Space wrap size={12}>
                <Button
                  type="primary"
                  size="large"
                  icon={<ArrowRightOutlined />}
                  onClick={onGetStarted}
                  aria-label="Get started with Sug Done"
                >
                  Get Started
                </Button>
                <Button
                  size="large"
                  icon={<PlayCircleOutlined />}
                  onClick={onViewDemo}
                  aria-label="View demo preview"
                >
                  View Demo
                </Button>
              </Space>
            </Space>
          </Col>

          <Col xs={24} lg={11}>
            <Card
              bordered={false}
              style={{
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.12)',
                borderRadius: 20,
                transition: 'transform 220ms ease',
              }}
              styles={{ body: { padding: 20 } }}
            >
              <Space direction="vertical" size={12} style={{ width: '100%' }}>
                <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                  <Text strong>Today Overview</Text>
                  <Tag color="red" style={{ marginInlineEnd: 0 }}>3 Due Soon</Tag>
                </Space>
                <Skeleton active paragraph={{ rows: 3 }} title={{ width: '60%' }} />
                <div>
                  <Text type="secondary" style={{ fontSize: 14 }}>
                    Weekly Progress
                  </Text>
                  <Progress percent={74} strokeColor={BRANDING.primaryColor} />
                </div>
                <Space>
                  <Tag color="blue">Table</Tag>
                  <Tag color="gold">Kanban</Tag>
                  <Tag color="green">Calendar</Tag>
                </Space>
              </Space>
            </Card>
          </Col>
        </Row>
      </div>
    </section>
  );
};

export default HeroSection;
