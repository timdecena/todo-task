import { Button, Card, Col, Row, Space, Tag, Typography } from 'antd';
import { ArrowRightOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { BRANDING } from '../config/branding';

const { Title, Text, Paragraph } = Typography;

const featureItems = [
  'Priorities and deadlines in one place',
  'Undo delete for safer task handling',
  'Table, Kanban, and Calendar views',
];

const techStack = ['Spring Boot 17', 'TypeScript', 'Vite', 'MySQL Workbench', 'Ant Design'];

/**
 * Simple modern landing page that routes users into the main task app.
 */
const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <main
      style={{
        minHeight: '100vh',
        background:
          'radial-gradient(circle at 14% 8%, rgba(209,35,42,0.12), transparent 30%), linear-gradient(180deg, #ffffff 0%, #fff9f9 100%)',
      }}
    >
      <div style={{ maxWidth: 1120, margin: '0 auto', padding: '64px 20px 48px' }}>
        <Row gutter={[28, 28]} align="middle">
          <Col xs={24} lg={14}>
            <Space direction="vertical" size={16} style={{ width: '100%' }}>
              <Tag color="red" style={{ width: 'fit-content', marginInlineEnd: 0 }}>
                Smart task management
              </Tag>
              <Title level={1} style={{ margin: 0, lineHeight: 1.14 }}>
                {BRANDING.appName}
              </Title>
              <Paragraph style={{ margin: 0, fontSize: 18, color: '#595959', maxWidth: 680 }}>
                {BRANDING.oneLineDescription}
              </Paragraph>

              <Space direction="vertical" size={8}>
                {featureItems.map((item) => (
                  <Space key={item} size={8}>
                    <CheckCircleOutlined style={{ color: BRANDING.primaryColor }} />
                    <Text>{item}</Text>
                  </Space>
                ))}
              </Space>

              <Space size={10} wrap style={{ marginTop: 8 }}>
                <Button
                  type="primary"
                  size="large"
                  icon={<ArrowRightOutlined />}
                  onClick={() => navigate('/tasks')}
                >
                  Get Started
                </Button>
              </Space>
            </Space>
          </Col>

          <Col xs={24} lg={10}>
            <Card
              bordered={false}
              style={{ borderRadius: 18, boxShadow: '0 16px 42px rgba(0, 0, 0, 0.1)' }}
              styles={{ body: { padding: 20 } }}
            >
              <Space direction="vertical" size={12} style={{ width: '100%' }}>
                <Text strong>Tech Stack</Text>
                <Space size={[8, 8]} wrap>
                  {techStack.map((item) => (
                    <Tag key={item} color="red" style={{ marginInlineEnd: 0 }}>
                      {item}
                    </Tag>
                  ))}
                </Space>
              </Space>
            </Card>
          </Col>
        </Row>

        <div style={{ marginTop: 44 }}>
          <Card
            bordered={false}
            style={{ background: BRANDING.primaryColor, borderRadius: 16 }}
            styles={{ body: { padding: '24px 20px', textAlign: 'center' } }}
          >
            <Space direction="vertical" size={10}>
              <Text style={{ color: '#fff', fontSize: 20, fontWeight: 600 }}>
                Keep tasks clear, simple, and done.
              </Text>
              <Button size="large" onClick={() => navigate('/tasks')}>
                Open Task List
              </Button>
            </Space>
          </Card>
        </div>
      </div>
    </main>
  );
};

export default LandingPage;
