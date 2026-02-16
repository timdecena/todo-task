import type { ReactNode } from 'react';
import { Card, Col, Row, Space, Typography } from 'antd';
import {
  ClockCircleOutlined,
  DeleteOutlined,
  FlagOutlined,
  SearchOutlined,
  SyncOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import { LANDING_SECTION_IDS } from '../../config/branding';

const { Title, Paragraph } = Typography;

const FEATURE_ITEMS: Array<{ title: string; desc: string; icon: ReactNode }> = [
  {
    title: 'Priorities',
    desc: 'Mark tasks as high, moderate, or low so your day stays focused.',
    icon: <FlagOutlined />,
  },
  {
    title: 'Deadlines',
    desc: 'Track due dates clearly with visual urgency and calendar support.',
    icon: <ClockCircleOutlined />,
  },
  {
    title: 'Undo Delete',
    desc: 'Recover accidentally deleted tasks in one click.',
    icon: <DeleteOutlined />,
  },
  {
    title: 'Weekly Reminders',
    desc: 'Use recurring tasks to stay consistent with routine work.',
    icon: <SyncOutlined />,
  },
  {
    title: 'Clean UI',
    desc: 'Simple layouts help users navigate quickly without confusion.',
    icon: <AppstoreOutlined />,
  },
  {
    title: 'Fast Search',
    desc: 'Find tasks instantly with quick search and smart filters.',
    icon: <SearchOutlined />,
  },
];

/**
 * Landing features section.
 */
const FeaturesSection = () => {
  return (
    <section id={LANDING_SECTION_IDS.features} aria-labelledby="features-title" style={{ padding: '26px 20px 62px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <Space direction="vertical" size={10} style={{ width: '100%', marginBottom: 24 }}>
          <Title id="features-title" level={2} style={{ margin: 0 }}>
            Features built for real daily work
          </Title>
          <Paragraph style={{ margin: 0, color: '#595959' }}>
            Sug Done is designed to keep teams organized without extra complexity.
          </Paragraph>
        </Space>

        <Row gutter={[16, 16]}>
          {FEATURE_ITEMS.map((feature) => (
            <Col xs={24} sm={12} lg={8} key={feature.title}>
              <Card
                hoverable
                style={{ borderRadius: 14, height: '100%' }}
                styles={{ body: { padding: 18 } }}
              >
                <Space direction="vertical" size={10}>
                  <span
                    style={{
                      width: 36,
                      height: 36,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 10,
                      background: 'rgba(209, 35, 42, 0.12)',
                      color: '#D1232A',
                      fontSize: 18,
                    }}
                  >
                    {feature.icon}
                  </span>
                  <Title level={4} style={{ margin: 0 }}>
                    {feature.title}
                  </Title>
                  <Paragraph style={{ margin: 0, color: '#595959' }}>{feature.desc}</Paragraph>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </section>
  );
};

export default FeaturesSection;
