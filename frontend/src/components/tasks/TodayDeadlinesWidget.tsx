import { memo, useEffect, useMemo, useState } from 'react';
import { Card, Empty, List, Space, Spin, Tag, Typography } from 'antd';
import dayjs from 'dayjs';
import type { TaskResponse } from '../../types/task';

type TodayDeadlinesWidgetProps = {
  tasks: TaskResponse[];
  loading?: boolean;
  onExpandChange?: (expanded: boolean) => void;
};

const { Text } = Typography;

const TodayDeadlinesWidget = ({
  tasks,
  loading = false,
  onExpandChange,
}: TodayDeadlinesWidgetProps) => {
  const [pageSize, setPageSize] = useState(3);

  useEffect(() => {
    onExpandChange?.(false);
  }, [onExpandChange]);

  const today = dayjs();
  const todayKey = today.format('YYYY-MM-DD');

  const todayTasks = useMemo(() => {
    return tasks
      .filter((task) => task.deadline && dayjs(task.deadline).format('YYYY-MM-DD') === todayKey)
      .sort((a, b) => dayjs(a.deadline).valueOf() - dayjs(b.deadline).valueOf());
  }, [tasks, todayKey]);

  return (
    <div
      style={{
        width: '100%',
      }}
    >
      <Card
        title="Today"
        styles={{ body: { padding: 8 } }}
      >
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 0' }}>
            <Spin />
          </div>
        ) : (
          <>
            <Space direction="vertical" size={4} style={{ width: '100%' }}>
              <Text strong style={{ fontSize: 14 }}>
                {today.format('dddd, MMM DD')}
              </Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {todayTasks.length === 0
                  ? 'No deadlines today'
                  : `${todayTasks.length} deadline${todayTasks.length > 1 ? 's' : ''} today`}
              </Text>
            </Space>

            <div
              style={{
                marginTop: 10,
              }}
            >
              {todayTasks.length === 0 ? (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No tasks due today" />
              ) : (
                <List
                  size="small"
                  dataSource={todayTasks}
                  pagination={{
                    pageSize,
                    size: 'small',
                    align: 'center',
                    showSizeChanger: true,
                    pageSizeOptions: ['3', '5', '10'],
                    onShowSizeChange: (_, size) => setPageSize(size),
                    showTotal: (total) => `${total} task${total !== 1 ? 's' : ''}`,
                  }}
                  renderItem={(task) => (
                    <List.Item key={task.id} style={{ paddingInline: 0 }}>
                      <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <Text style={{ display: 'block' }} ellipsis={{ tooltip: task.title }}>
                            {task.title}
                          </Text>
                        </div>
                        <Tag style={{ marginInlineEnd: 0, flex: '0 0 auto' }}>
                          {task.deadline ? dayjs(task.deadline).format('hh:mm A') : '--:--'}
                        </Tag>
                      </div>
                    </List.Item>
                  )}
                />
              )}
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default memo(TodayDeadlinesWidget);
