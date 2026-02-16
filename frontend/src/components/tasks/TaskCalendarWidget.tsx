import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Calendar, Card, Col, Empty, List, Modal, Row, Segmented, Select, Space, Spin, Tag, Tooltip, Typography } from 'antd';
import { CheckCircleFilled, ExpandOutlined, EyeOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import TaskDetailsModal from './TaskDetailsModal';
import type { TaskResponse } from '../../types/task';

type TaskCalendarWidgetProps = {
  tasks: TaskResponse[];
  loading?: boolean;
  onExpandChange?: (expanded: boolean) => void;
  onTasksChanged?: () => Promise<void> | void;
  onDeleteTask?: (id: number) => Promise<void> | void;
};

const { Text } = Typography;
type DeadlineUrgency = 'RED' | 'ORANGE' | 'YELLOW' | 'NONE';
type CalendarViewMode = 'week' | 'month' | 'year';

const sortByDeadlineAsc = (a: TaskResponse, b: TaskResponse): number => {
  const aValue = a.deadline ? dayjs(a.deadline).valueOf() : Number.MAX_SAFE_INTEGER;
  const bValue = b.deadline ? dayjs(b.deadline).valueOf() : Number.MAX_SAFE_INTEGER;
  return aValue - bValue;
};

const getDeadlineUrgency = (deadline?: string): DeadlineUrgency => {
  if (!deadline) return 'NONE';
  const hoursLeft = dayjs(deadline).diff(dayjs(), 'hour', true);
  if (hoursLeft <= 24) return 'RED';
  if (hoursLeft <= 24 * 7) return 'ORANGE';
  return 'YELLOW';
};

const getUrgencyColor = (urgency: DeadlineUrgency): string | undefined => {
  if (urgency === 'RED') return 'red';
  if (urgency === 'ORANGE') return 'orange';
  if (urgency === 'YELLOW') return 'gold';
  return undefined;
};

const getDayUrgency = (tasks: TaskResponse[]): DeadlineUrgency => {
  if (tasks.some((task) => getDeadlineUrgency(task.deadline) === 'RED')) return 'RED';
  if (tasks.some((task) => getDeadlineUrgency(task.deadline) === 'ORANGE')) return 'ORANGE';
  if (tasks.some((task) => getDeadlineUrgency(task.deadline) === 'YELLOW')) return 'YELLOW';
  return 'NONE';
};

const TaskCalendarWidget = ({
  tasks,
  loading = false,
  onExpandChange,
  onTasksChanged,
  onDeleteTask,
}: TaskCalendarWidgetProps) => {
  const [expandedOpen, setExpandedOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [viewMode, setViewMode] = useState<CalendarViewMode>('month');
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<number | undefined>(undefined);
  const lastWheelTsRef = useRef(0);
  const wheelDeltaRef = useRef(0);

  useEffect(() => {
    onExpandChange?.(false);
  }, [onExpandChange]);

  const tasksByDate = useMemo(() => {
    const grouped: Record<string, TaskResponse[]> = {};

    tasks.forEach((task) => {
      if (!task.deadline) return;
      const key = dayjs(task.deadline).format('YYYY-MM-DD');

      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(task);
    });

    Object.keys(grouped).forEach((key) => {
      grouped[key].sort(sortByDeadlineAsc);
    });

    return grouped;
  }, [tasks]);

  const selectedDateKey = selectedDate.format('YYYY-MM-DD');
  const selectedDateTasks = tasksByDate[selectedDateKey] ?? [];
  const weekStart = selectedDate.startOf('week');
  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, index) => weekStart.add(index, 'day')),
    [weekStart]
  );

  const movePeriod = (direction: 1 | -1) => {
    const unit = viewMode === 'week' ? 'week' : viewMode === 'year' ? 'year' : 'month';
    setSelectedDate((prev) => prev.add(direction, unit));
  };

  const monthOptions = useMemo(
    () =>
      Array.from({ length: 12 }, (_, index) => ({
        label: dayjs().month(index).format('MMMM'),
        value: index,
      })),
    []
  );

  const yearOptions = useMemo(() => {
    const center = selectedDate.year();
    return Array.from({ length: 13 }, (_, index) => {
      const year = center - 6 + index;
      return { label: String(year), value: year };
    });
  }, [selectedDate]);

  const refreshTasks = async () => {
    if (!onTasksChanged) return;
    await onTasksChanged();
  };

  const openDetails = (id: number) => {
    setSelectedTaskId(id);
    setDetailsOpen(true);
  };

  const closeDetails = () => {
    setDetailsOpen(false);
    setSelectedTaskId(undefined);
  };

  const handleCalendarWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    const now = Date.now();
    event.preventDefault();

    // Accumulate wheel distance so month/year changes happen slower and predictably.
    wheelDeltaRef.current += event.deltaY;
    if (Math.abs(wheelDeltaRef.current) < 260) return;
    if (now - lastWheelTsRef.current < 180) return;

    lastWheelTsRef.current = now;
    const direction = wheelDeltaRef.current > 0 ? 1 : -1;
    wheelDeltaRef.current = 0;
    movePeriod(direction as 1 | -1);
  };

  const renderTaskLine = (task: TaskResponse, plannerView = false) => {
    const urgency = getDeadlineUrgency(task.deadline);
    const dotColor = urgency === 'RED' ? '#ff4d4f' : urgency === 'ORANGE' ? '#fa8c16' : '#fadb14';
    return (
      <div
        key={task.id}
        title={task.title}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          minWidth: 0,
          borderRadius: plannerView ? 6 : 0,
          background:
            plannerView && urgency === 'RED'
              ? '#fff1f0'
              : plannerView && urgency === 'ORANGE'
                ? '#fff7e6'
                : plannerView && urgency === 'YELLOW'
                  ? '#feffe6'
                : undefined,
          padding: plannerView ? '2px 4px' : '0 1px',
        }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: dotColor,
            flex: '0 0 auto',
          }}
        />
        <span
          style={{
            fontSize: plannerView ? 11 : 10,
            lineHeight: plannerView ? '14px' : '12px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {task.title}
        </span>
        {plannerView && (
          <Space size={4}>
            {(task.status === 'DONE' || task.status === 'COMPLETED') && (
              <Tooltip title="Completed">
                <CheckCircleFilled style={{ color: '#52c41a', fontSize: 14 }} />
              </Tooltip>
            )}
            <Tooltip title="View task">
              <Button
                size="small"
                shape="circle"
                icon={<EyeOutlined />}
                onClick={() => openDetails(task.id)}
                style={{ width: 18, height: 18, minWidth: 18 }}
              />
            </Tooltip>
          </Space>
        )}
      </div>
    );
  };

  const dateCellRender = (value: Dayjs, plannerView = false) => {
    const key = value.format('YYYY-MM-DD');
    const dayTasks = tasksByDate[key] ?? [];

    if (!plannerView) {
      if (!dayTasks.length) return null;
      const dayUrgency = getDayUrgency(dayTasks);
      return (
        <div style={{ position: 'relative', width: '100%', height: 0 }}>
          <span
            style={{
              position: 'absolute',
              top: -16,
              right: 2,
              minWidth: 15,
              height: 15,
              padding: '0 4px',
              borderRadius: 10,
              background:
                dayUrgency === 'RED'
                  ? '#ff4d4f'
                  : dayUrgency === 'ORANGE'
                    ? '#fa8c16'
                    : '#fadb14',
              color: dayUrgency === 'YELLOW' ? '#614700' : '#fff',
              fontSize: 10,
              lineHeight: '15px',
              textAlign: 'center',
              pointerEvents: 'none',
            }}
          >
            {dayTasks.length}
          </span>
        </div>
      );
    }

    if (!dayTasks.length) return null;

    const maxVisible = 3;
    const visible = dayTasks.slice(0, maxVisible);
    const hiddenCount = dayTasks.length - visible.length;
    const dayUrgency = getDayUrgency(dayTasks);
    const dayTagColor = getUrgencyColor(dayUrgency);

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          marginTop: 2,
          borderRadius: plannerView ? 8 : 0,
          padding: plannerView ? 4 : 0,
          background:
            plannerView && dayUrgency === 'RED'
              ? '#fff7f6'
              : plannerView && dayUrgency === 'ORANGE'
                ? '#fffaf2'
                : plannerView && dayUrgency === 'YELLOW'
                  ? '#feffed'
                : undefined,
          border:
            plannerView && dayTagColor
              ? `1px solid ${dayUrgency === 'RED' ? '#ffa39e' : dayUrgency === 'ORANGE' ? '#ffd591' : '#ffe58f'}`
              : undefined,
          maxHeight: plannerView ? 82 : 20,
          overflow: 'hidden',
        }}
      >
        {visible.map((task) => renderTaskLine(task, plannerView))}
        {hiddenCount > 0 && (
          <Text
            type="secondary"
            style={{
              fontSize: plannerView ? 10 : 9,
              color:
                dayUrgency === 'RED'
                  ? '#cf1322'
                  : dayUrgency === 'ORANGE'
                    ? '#d46b08'
                    : dayUrgency === 'YELLOW'
                      ? '#876800'
                      : undefined,
              lineHeight: '11px',
            }}
          >
            +{hiddenCount} more
          </Text>
        )}
      </div>
    );
  };

  const renderWeekPanel = () => (
    <Row gutter={[8, 8]}>
      {weekDays.map((day) => {
        const key = day.format('YYYY-MM-DD');
        const dayTasks = tasksByDate[key] ?? [];
        const urgency = getDayUrgency(dayTasks);
        const headerColor =
          urgency === 'RED' ? '#fff1f0' : urgency === 'ORANGE' ? '#fff7e6' : urgency === 'YELLOW' ? '#feffe6' : '#fafafa';

        return (
          <Col xs={24} sm={12} md={8} lg={6} xl={3} key={key}>
            <Card
              size="small"
              styles={{ body: { padding: 8 } }}
              style={{ minHeight: 170 }}
              title={
                <div style={{ background: headerColor, padding: '2px 6px', borderRadius: 6 }}>
                  <Text strong style={{ fontSize: 12 }}>
                    {day.format('ddd, MMM D')}
                  </Text>
                </div>
              }
            >
              {dayTasks.length === 0 ? (
                <Text type="secondary" style={{ fontSize: 12 }}>No tasks</Text>
              ) : (
                <Space direction="vertical" size={4} style={{ width: '100%' }}>
                  {dayTasks.slice(0, 3).map((task) => (
                    <div key={task.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 6 }}>
                      <Text ellipsis={{ tooltip: task.title }} style={{ fontSize: 12, maxWidth: 120 }}>
                        {task.title}
                      </Text>
                      <Space size={4}>
                        {(task.status === 'DONE' || task.status === 'COMPLETED') && (
                          <Tooltip title="Completed">
                            <CheckCircleFilled style={{ color: '#52c41a', fontSize: 14 }} />
                          </Tooltip>
                        )}
                        <Button
                          size="small"
                          shape="circle"
                          icon={<EyeOutlined />}
                          onClick={() => openDetails(task.id)}
                          style={{ width: 18, height: 18, minWidth: 18 }}
                        />
                      </Space>
                    </div>
                  ))}
                  {dayTasks.length > 3 && (
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      +{dayTasks.length - 3} more
                    </Text>
                  )}
                </Space>
              )}
            </Card>
          </Col>
        );
      })}
    </Row>
  );

  const renderYearPanel = () => {
    const yearBase = selectedDate.startOf('year');
    const months = Array.from({ length: 12 }, (_, index) => yearBase.add(index, 'month'));

    return (
      <Row gutter={[10, 10]}>
        {months.map((month) => {
          const monthStart = month.startOf('month').valueOf();
          const monthEnd = month.endOf('month').valueOf();
          const monthTasks = tasks
            .filter((task) => task.deadline)
            .filter((task) => {
              const ts = dayjs(task.deadline as string).valueOf();
              return ts >= monthStart && ts <= monthEnd;
            })
            .sort(sortByDeadlineAsc);
          const urgentCount = monthTasks.filter(
            (task) => getDeadlineUrgency(task.deadline) === 'RED' || getDeadlineUrgency(task.deadline) === 'ORANGE'
          ).length;

          return (
            <Col xs={24} sm={12} md={8} lg={6} key={month.format('YYYY-MM')}>
              <Card
                size="small"
                hoverable
                onClick={() => {
                  setSelectedDate(month);
                  setViewMode('month');
                }}
                styles={{ body: { padding: 10 } }}
              >
                <Space direction="vertical" size={4} style={{ width: '100%' }}>
                  <Text strong>{month.format('MMMM')}</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {monthTasks.length} task{monthTasks.length !== 1 ? 's' : ''}
                  </Text>
                  {urgentCount > 0 && (
                    <Tag color="red" style={{ marginInlineEnd: 0, width: 'fit-content' }}>
                      {urgentCount} urgent
                    </Tag>
                  )}
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    {monthTasks[0]?.deadline ? `Next: ${dayjs(monthTasks[0].deadline).format('MMM D')}` : 'No deadlines'}
                  </Text>
                </Space>
              </Card>
            </Col>
          );
        })}
      </Row>
    );
  };

  return (
    <>
      <div
        style={{
          width: '100%',
          transition: 'transform 280ms cubic-bezier(0.22, 1, 0.36, 1)',
          transform: 'translateY(0)',
        }}
      >
        <Card
          title="Calendar"
          extra={
            <Space size={8}>
              <Tooltip title="Open full calendar">
                <Button size="small" shape="circle" icon={<ExpandOutlined />} onClick={() => setExpandedOpen(true)} />
              </Tooltip>
            </Space>
          }
          styles={{
            body: {
              padding: 6,
              transition: 'padding 260ms cubic-bezier(0.22, 1, 0.36, 1)',
            },
          }}
        >
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 0' }}>
              <Spin />
            </div>
          ) : (
            <>
              <div
                style={{
                  maxHeight: 245,
                  overflow: 'hidden',
                  transition: 'max-height 300ms cubic-bezier(0.22, 1, 0.36, 1)',
                }}
                onWheel={handleCalendarWheel}
              >
                <Calendar
                  fullscreen={false}
                  value={selectedDate}
                  onSelect={(value) => setSelectedDate(value)}
                  onPanelChange={(value) => setSelectedDate(value)}
                  cellRender={(value, info) => (info.type === 'date' ? dateCellRender(value, false) : info.originNode)}
                />
              </div>
            </>
          )}
        </Card>
      </div>

      <Modal
        open={expandedOpen}
        title="Task Calendar"
        width={1200}
        onCancel={() => setExpandedOpen(false)}
        footer={null}
        destroyOnHidden
      >
        <div
          onWheel={handleCalendarWheel}
          style={{ maxHeight: '72vh', overflowY: 'auto', paddingRight: 6 }}
        >
          <Space direction="vertical" size={10} style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <Space style={{ width: '100%', justifyContent: 'center' }} wrap>
                <Button onClick={() => movePeriod(-1)}>{'<'}</Button>
                <Button onClick={() => setSelectedDate(dayjs())}>Today</Button>
                <Button onClick={() => movePeriod(1)}>{'>'}</Button>
                <Segmented
                  size="middle"
                  value={viewMode}
                  onChange={(value) => setViewMode(value as CalendarViewMode)}
                  options={[
                    { label: 'Week', value: 'week' },
                    { label: 'Month', value: 'month' },
                    { label: 'Year', value: 'year' },
                  ]}
                />
                {viewMode === 'month' && (
                  <>
                    <Select
                      value={selectedDate.month()}
                      options={monthOptions}
                      style={{ width: 140 }}
                      onChange={(value) => {
                        setSelectedDate((prev) => prev.month(value));
                      }}
                    />
                    <Select
                      value={selectedDate.year()}
                      options={yearOptions}
                      style={{ width: 110 }}
                      onChange={(value) => {
                        setSelectedDate((prev) => prev.year(value));
                      }}
                    />
                  </>
                )}
                {viewMode === 'year' && (
                  <Select
                    value={selectedDate.year()}
                    options={yearOptions}
                    style={{ width: 110 }}
                    onChange={(value) => {
                      setSelectedDate((prev) => prev.year(value));
                    }}
                  />
                )}
                <Text strong>
                  {viewMode === 'year'
                    ? selectedDate.format('YYYY')
                    : viewMode === 'week'
                      ? `${weekStart.format('MMM D')} - ${weekStart.add(6, 'day').format('MMM D, YYYY')}`
                      : `${selectedDate.format('MMMM')} ${selectedDate.format('YYYY')}`}
                </Text>
              </Space>
            </div>

            <Text type="secondary" style={{ fontSize: 12 }}>
              Scroll to move across the selected period.
            </Text>

            {viewMode === 'month' && (
              <Calendar
                value={selectedDate}
                onSelect={(value) => setSelectedDate(value)}
                onPanelChange={(value) => setSelectedDate(value)}
                headerRender={() => null}
                cellRender={(value, info) => (info.type === 'date' ? dateCellRender(value, true) : info.originNode)}
              />
            )}
            {viewMode === 'week' && renderWeekPanel()}
            {viewMode === 'year' && renderYearPanel()}

            <Card
              size="small"
              title={`Tasks on ${selectedDate.format('MMM DD, YYYY')}`}
              styles={{ body: { padding: 8 } }}
            >
              {selectedDateTasks.length === 0 ? (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No tasks on selected date" />
              ) : (
                <div style={{ maxHeight: 260, overflowY: 'auto', paddingRight: 4 }}>
                  <List
                    size="small"
                    dataSource={selectedDateTasks}
                    renderItem={(task) => (
                      <List.Item key={task.id} style={{ paddingInline: 0 }}>
                        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                          <Space size={6}>
                            {(task.status === 'DONE' || task.status === 'COMPLETED') && (
                              <CheckCircleFilled style={{ color: '#52c41a' }} />
                            )}
                            <Text ellipsis={{ tooltip: task.title }} style={{ maxWidth: 260 }}>
                              {task.title}
                            </Text>
                          </Space>
                          <Button size="small" icon={<EyeOutlined />} onClick={() => openDetails(task.id)}>
                            View
                          </Button>
                        </div>
                      </List.Item>
                    )}
                  />
                </div>
              )}
            </Card>
          </Space>
        </div>
      </Modal>

      <TaskDetailsModal
        open={detailsOpen}
        taskId={selectedTaskId}
        onClose={closeDetails}
        onDeleteTask={onDeleteTask}
        onDeleted={() => {
          void refreshTasks();
        }}
        onUpdated={() => {
          void refreshTasks();
        }}
      />
    </>
  );
};

export default memo(TaskCalendarWidget);
