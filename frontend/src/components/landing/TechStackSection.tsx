import { Card, Col, Row, Space, Tag, Timeline, Typography } from 'antd';
import { LANDING_SECTION_IDS, TECH_STACK_ITEMS } from '../../config/branding';

const { Title, Paragraph, Text } = Typography;

/**
 * Tech stack showcase section.
 */
const TechStackSection = () => {
  return (
    <section id={LANDING_SECTION_IDS.techStack} aria-labelledby="tech-stack-title" style={{ padding: '10px 20px 62px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <Space direction="vertical" size={10} style={{ width: '100%', marginBottom: 22 }}>
          <Title id="tech-stack-title" level={2} style={{ margin: 0 }}>
            Technical stack
          </Title>
          <Paragraph style={{ margin: 0, color: '#595959' }}>
            Modern tools chosen for speed, maintainability, and team collaboration.
          </Paragraph>
        </Space>

        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title="Core Technologies" style={{ height: '100%' }}>
              <Space size={[8, 8]} wrap>
                {TECH_STACK_ITEMS.map((item) => (
                  <Tag key={item} color="red" style={{ marginInlineEnd: 0 }}>
                    {item}
                  </Tag>
                ))}
              </Space>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="Architecture" style={{ height: '100%' }}>
              <Space direction="vertical" size={10} style={{ width: '100%' }}>
                <Text>
                  Monolithic architecture: one backend service and one frontend app, focused on fast delivery and easy
                  maintenance.
                </Text>
                <Timeline
                  items={[
                    { color: 'red', children: 'React + TypeScript UI (Vite)' },
                    { color: 'red', children: 'REST API with Spring Boot 17' },
                    { color: 'red', children: 'MySQL data persistence' },
                  ]}
                />
              </Space>
            </Card>
          </Col>
        </Row>
      </div>
    </section>
  );
};

export default TechStackSection;

