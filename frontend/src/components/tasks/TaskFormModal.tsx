import React, { useEffect } from 'react';
import { DatePicker, Form, Input, Modal, Select, Typography } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import type { TaskRequest } from '../../types/task';

/*
  This modal contains the form used for both creating and editing tasks.
  It validates required fields and sends clean payload data back to the parent page.
*/
interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: TaskRequest) => void;
  initialValues?: TaskRequest;
}

type FormValues = {
  title: string;
  description?: string;
  priority?: TaskRequest['priority'];
  status?: TaskRequest['status'];
  recurrenceType?: TaskRequest['recurrenceType'];
  recurrenceInterval?: number;
  recurrenceEndAt?: Dayjs;
  deadline?: Dayjs;
};

// This modal handles both Create and Edit.
// If `initialValues` exists, we are editing.
const TaskFormModal: React.FC<Props> = ({ open, onClose, onSubmit, initialValues }) => {
  const [form] = Form.useForm<FormValues>();
  const isDoneTask =
    !!initialValues && (initialValues.status === 'DONE' || initialValues.status === 'COMPLETED');

  // Fill the form every time modal opens.
  useEffect(() => {
    if (!open) return;

    if (initialValues) {
      form.setFieldsValue({
        title: initialValues.title ?? '',
        description: initialValues.description ?? '',
        priority: initialValues.priority,
        status: initialValues.status,
        recurrenceType: initialValues.recurrenceType ?? 'NONE',
        recurrenceInterval: initialValues.recurrenceInterval ?? 1,
        recurrenceEndAt: initialValues.recurrenceEndAt
          ? dayjs(initialValues.recurrenceEndAt).second(0).millisecond(0)
          : undefined,
        deadline: initialValues.deadline
          ? dayjs(initialValues.deadline).second(0).millisecond(0)
          : undefined,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        // sensible defaults (optional fields)
        priority: 'LOW',
        status: 'TODO',
        recurrenceType: 'NONE',
        recurrenceInterval: 1,
        deadline: undefined,
      });
    }
  }, [open, initialValues, form]);

  // Validate, then send cleaned data to parent.
  const handleOk = async (): Promise<void> => {
    const values = await form.validateFields();

    const payload: TaskRequest = {
      title: values.title.trim(),
      description: values.description?.trim() || '',
      priority: values.priority,
      status: isDoneTask ? initialValues?.status : values.status,
      recurrenceType: values.recurrenceType ?? 'NONE',
      recurrenceInterval:
        values.recurrenceType && values.recurrenceType !== 'NONE'
          ? Math.max(values.recurrenceInterval ?? 1, 1)
          : 1,
      recurrenceEndAt:
        values.recurrenceType && values.recurrenceType !== 'NONE' && values.recurrenceEndAt
          ? values.recurrenceEndAt.second(0).millisecond(0).format('YYYY-MM-DDTHH:mm:ss')
          : undefined,
      deadline: values.deadline
        ? values.deadline.second(0).millisecond(0).format('YYYY-MM-DDTHH:mm:ss')
        : undefined,
    };

    onSubmit(payload);
  };

  // Block dates before today.
  const disabledDate = (current: Dayjs | null): boolean => {
    if (!current) return false;
    return current.isBefore(dayjs().startOf('day'));
  };

  // Deadline is optional, but if set it must be in the future.
  // If recurrence is enabled, deadline becomes required.
  const validateFutureDeadline = async (_: unknown, value?: Dayjs): Promise<void> => {
    const recurrenceType = form.getFieldValue('recurrenceType');
    const recurring = recurrenceType && recurrenceType !== 'NONE';

    if (!value) {
      if (recurring) {
        throw new Error('Please select deadline for recurring task');
      }
      return;
    }
    if (!value.isAfter(dayjs())) throw new Error('Deadline must be in the future');
  };

  return (
    <Modal
      open={open}
      title={initialValues ? 'Edit Task' : 'Create Task'}
      onCancel={onClose}
      onOk={handleOk}
      okText={initialValues ? 'Update' : 'Create'}
      destroyOnHidden
    >
      <Form<FormValues> layout="vertical" form={form}>
        <Form.Item
          label="Title"
          name="title"
          rules={[{ required: true, message: 'Task title should not be empty' }]}
        >
          <Input placeholder="e.g. Finish report" />
        </Form.Item>

        <Form.Item label="Description" name="description">
          <Input.TextArea rows={3} placeholder="Optional description" />
        </Form.Item>

        <Form.Item label="Priority" name="priority">
          <Select
            placeholder="Select priority (optional)"
            allowClear
            options={[
              { value: 'LOW', label: 'Low' },
              { value: 'MODERATE', label: 'Moderate' },
              { value: 'HIGH', label: 'High' },
            ]}
          />
        </Form.Item>

        {!isDoneTask ? (
          <Form.Item label="Status" name="status">
            <Select
              placeholder="Select status (optional)"
              allowClear
              options={[
                { value: 'TODO', label: 'Todo' },
                { value: 'IN_PROGRESS', label: 'In Progress' },
                { value: 'DONE', label: 'Done' },
              ]}
            />
          </Form.Item>
        ) : (
          <Form.Item label="Status">
            <Typography.Text type="secondary">Done (locked)</Typography.Text>
          </Form.Item>
        )}

        <Form.Item label="Recurrence" name="recurrenceType">
          <Select
            options={[
              { value: 'NONE', label: 'None' },
              { value: 'DAILY', label: 'Daily' },
              { value: 'WEEKLY', label: 'Weekly' },
              { value: 'MONTHLY', label: 'Monthly' },
            ]}
          />
        </Form.Item>

        <Form.Item noStyle shouldUpdate={(prev, curr) => prev.recurrenceType !== curr.recurrenceType}>
          {({ getFieldValue }) =>
            getFieldValue('recurrenceType') && getFieldValue('recurrenceType') !== 'NONE' ? (
              <>
                <Form.Item
                  label="Recurrence Interval"
                  name="recurrenceInterval"
                  rules={[{ required: true, message: 'Please set recurrence interval' }]}
                >
                  <Input type="number" min={1} placeholder="Every 1 cycle" />
                </Form.Item>

                <Form.Item label="Recurrence End (Optional)" name="recurrenceEndAt">
                  <DatePicker
                    showTime={{ format: 'HH:mm', minuteStep: 1, showSecond: false }}
                    format="YYYY-MM-DD HH:mm"
                    className="w-full"
                    disabledDate={disabledDate}
                  />
                </Form.Item>
              </>
            ) : null
          }
        </Form.Item>

        <Form.Item
          label="Deadline"
          name="deadline"
          rules={[{ validator: validateFutureDeadline }]}
        >
          <DatePicker
            showTime={{ format: 'HH:mm', minuteStep: 1, showSecond: false }}
            format="YYYY-MM-DD HH:mm"
            className="w-full"
            disabledDate={disabledDate}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default TaskFormModal;
