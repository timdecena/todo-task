import { Card, Col, List, Row, Space, Tabs, Tag, Typography } from 'antd';
import { LANDING_SECTION_IDS } from '../../config/branding';

const { Title, Paragraph, Text } = Typography;

const tablePreview = ['Design landing page', 'Review backlog', 'Fix urgent bug', 'Prepare sprint demo'];
const kanbanPreview = {
  todo: ['Draft API contract', 'Write unit tests'],
  inProgress: ['Implement Kanban sorting'],
  done: ['Undo delete flow'],
};
const calendarPreview = ['Mon: Team sync', 'Wed: Deadline review', 'Fri: Demo rehearsal'];

/**
 * Demo section with tabbed product previews.
 */
const PreviewSection = () => {
  return (
    <section id={LANDING_SECTION_IDS.demo} aria-labelledby="demo-title" style={{ padding: '10px 20px 62px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <Space direction="vertical" size={10} style={{ width: '100%', marginBottom: 22 }}>
          <Title id="demo-title" level={2} style={{ margin: 0 }}>
            Product preview
          </Title>
          <Paragraph style={{ margin: 0, color: '#595959' }}>
            See how Sug Done supports different planning styles in one place.
          </Paragraph>
        </Space>

        <Card bordered={false} style={{ boxShadow: '0 12px 36px rgba(0, 0, 0, 0.06)' }}>
          <Tabs
            defaultActiveKey="table"
            items={[
              {
                key: 'table',
                label: 'Table',
                children: (
                  <List
                    dataSource={tablePreview}
                    renderItem={(item) => (
                      <List.Item>
                        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                          <Text>{item}</Text>
                          <Tag color="blue">Open</Tag>
                        </Space>
                      </List.Item>
                    )}
                  />
                ),
              },
              {
                key: 'kanban',
                label: 'Kanban',
                children: (
                  <Row gutter={[12, 12]}>
                    <Col xs={24} md={8}>
                      <Card size="small" title="Todo">
                        <List dataSource={kanbanPreview.todo} renderItem={(item) => <List.Item>{item}</List.Item>} />
                      </Card>
                    </Col>
                    <Col xs={24} md={8}>
                      <Card size="small" title="In Progress">
                        <List
                          dataSource={kanbanPreview.inProgress}
                          renderItem={(item) => <List.Item>{item}</List.Item>}
                        />
                      </Card>
                    </Col>
                    <Col xs={24} md={8}>
                      <Card size="small" title="Done">
                        <List dataSource={kanbanPreview.done} renderItem={(item) => <List.Item>{item}</List.Item>} />
                      </Card>
                    </Col>
                  </Row>
                ),
              },
              {
                key: 'calendar',
                label: 'Calendar',
                children: (
                  <List
                    dataSource={calendarPreview}
                    renderItem={(item) => (
                      <List.Item>
                        <Space>
                          <Tag color="green" style={{ marginInlineEnd: 0 }}>
                            Event
                          </Tag>
                          <Text>{item}</Text>
                        </Space>
                      </List.Item>
                    )}
                  />
                ),
              },
            ]}
          />
        </Card>
      </div>
    </section>
  );
};

export default PreviewSection;

