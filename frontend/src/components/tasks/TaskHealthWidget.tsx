import { useEffect, useMemo, useState } from 'react';
import { Card, DatePicker, Empty, List, Space, Spin, Tag, Typography } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import type { TaskResponse } from '../../types/task';

type TaskHealthWidgetProps = {
  tasks: TaskResponse[];
  loading?: boolean;
};

type HealthLevel = 'ON_TRACK' | 'DUE_SOON' | 'OVERDUE';

const { Text } = Typography;

/**
 * Calculates task health based on status, priority, and deadline proximity.
 *
 * @param task task to evaluate
 * @param referenceTime point-in-time used for proximity checks
 * @returns health level of the task
 */
const getTaskHealth = (task: TaskResponse, referenceTime: Dayjs): HealthLevel => {
  if (task.status === 'DONE' || task.status === 'COMPLETED') {
    return 'ON_TRACK';
  }

  if (!task.deadline) {
    return 'ON_TRACK';
  }

  const deadline = dayjs(task.deadline);
  const hoursLeft = deadline.diff(referenceTime, 'hour', true);

  if (hoursLeft < 0) {
    return 'OVERDUE';
  }

  const dueSoonHours =
    task.priority === 'HIGH' ? 72 :
    task.priority === 'MODERATE' ? 48 : 24;

  if (hoursLeft <= dueSoonHours) {
    return 'DUE_SOON';
  }

  return 'ON_TRACK';
};

const healthMeta: Record<HealthLevel, { label: string; color: string; emoji: string }> = {
  ON_TRACK: { label: 'On Track', color: 'green', emoji: '🟢' },
  DUE_SOON: { label: 'Due Soon', color: 'gold', emoji: '🟡' },
  OVERDUE: { label: 'Overdue', color: 'red', emoji: '🔴' },
};

/**
 * Displays intelligent daily health of tasks for a selected date.
 */
const TaskHealthWidget = ({ tasks, loading = false }: TaskHealthWidgetProps) => {
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [pageSize, setPageSize] = useState(3);
  const [now, setNow] = useState(dayjs());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(dayjs());
    }, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const referenceTime = useMemo(() => {
    return selectedDate.isSame(now, 'day') ? now : selectedDate.endOf('day');
  }, [selectedDate, now]);

  const tasksForDay = useMemo(() => {
    return tasks.filter((task) => task.deadline && dayjs(task.deadline).isSame(selectedDate, 'day'));
  }, [tasks, selectedDate]);

  const analyzed = useMemo(() => {
    return tasksForDay.map((task) => ({
      task,
      health: getTaskHealth(task, referenceTime),
    }));
  }, [tasksForDay, referenceTime]);

  const overallHealth = useMemo<HealthLevel>(() => {
    if (analyzed.some((item) => item.health === 'OVERDUE')) return 'OVERDUE';
    if (analyzed.some((item) => item.health === 'DUE_SOON')) return 'DUE_SOON';
    return 'ON_TRACK';
  }, [analyzed]);

  return (
    <Card title="Smart Task Health" styles={{ body: { padding: 8 } }}>
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '18px 0' }}>
          <Spin />
        </div>
      ) : (
        <Space direction="vertical" size={10} style={{ width: '100%' }}>
          <DatePicker
            value={selectedDate}
            onChange={(value) => {
              if (value) setSelectedDate(value);
            }}
            allowClear={false}
            style={{ width: '100%' }}
          />

          <Tag color={healthMeta[overallHealth].color} style={{ marginInlineEnd: 0, width: 'fit-content' }}>
            {healthMeta[overallHealth].emoji} {healthMeta[overallHealth].label}
          </Tag>

          <Text type="secondary" style={{ fontSize: 12 }}>
            {analyzed.length} task{analyzed.length !== 1 ? 's' : ''} due on {selectedDate.format('MMM DD, YYYY')}
          </Text>

          {analyzed.length === 0 ? (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No tasks on selected date" />
          ) : (
            <div
              style={{
              }}
            >
              <List
                size="small"
                dataSource={analyzed}
                pagination={{
                  pageSize,
                  size: 'small',
                  align: 'center',
                  showSizeChanger: true,
                  pageSizeOptions: ['3', '5', '10'],
                  onShowSizeChange: (_, size) => setPageSize(size),
                  showTotal: (total) => `${total} task${total !== 1 ? 's' : ''}`,
                }}
                renderItem={({ task, health }) => (
                  <List.Item key={task.id} style={{ paddingInline: 0 }}>
                    <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                      <Text style={{ maxWidth: 145 }} ellipsis={{ tooltip: task.title }}>
                        {task.title}
                      </Text>
                      <Tag color={healthMeta[health].color} style={{ marginInlineEnd: 0 }}>
                        {healthMeta[health].label}
                      </Tag>
                    </div>
                  </List.Item>
                )}
              />
            </div>
          )}
        </Space>
      )}
    </Card>
  );
};

export default TaskHealthWidget;
