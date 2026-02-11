import React, { useEffect } from 'react';
import { DatePicker, Form, Input, Modal, Select } from 'antd';
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
  deadline: Dayjs;
};

// This modal handles both Create and Edit.
// If `initialValues` exists, we are editing.
const TaskFormModal: React.FC<Props> = ({ open, onClose, onSubmit, initialValues }) => {
  const [form] = Form.useForm<FormValues>();

  // Fill the form every time modal opens.
  useEffect(() => {
    if (!open) return;

    if (initialValues) {
      form.setFieldsValue({
        title: initialValues.title ?? '',
        description: initialValues.description ?? '',
        priority: initialValues.priority,
        status: initialValues.status,
        deadline: initialValues.deadline
          ? dayjs(initialValues.deadline).second(0).millisecond(0)
          : dayjs().add(1, 'hour').second(0).millisecond(0),
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        // sensible defaults (optional fields)
        priority: 'LOW',
        status: 'PENDING',
        // default deadline is 1 hour ahead
        deadline: dayjs().add(1, 'hour').second(0).millisecond(0),
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
      status: values.status,
      deadline: values.deadline.second(0).millisecond(0).format('YYYY-MM-DDTHH:mm:ss'),
    };

    onSubmit(payload);
  };

  // Block dates before today.
  const disabledDate = (current: Dayjs | null): boolean => {
    if (!current) return false;
    return current.isBefore(dayjs().startOf('day'));
  };

  // User must choose a time after "now".
  const validateFutureDeadline = async (_: unknown, value?: Dayjs): Promise<void> => {
    if (!value) throw new Error('Please select deadline');
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

        <Form.Item label="Status" name="status">
          <Select
            placeholder="Select status (optional)"
            allowClear
            options={[
              { value: 'PENDING', label: 'Pending' },
              { value: 'COMPLETED', label: 'Completed' },
            ]}
          />
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
