import React, { useEffect } from 'react';
import { DatePicker, Form, Input, Modal, Select } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import type { TaskRequest } from '../../types/task';

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

/**
 * TaskFormModal Component
 *
 * Summary:
 * - Ant Design modal form for Create/Edit task.
 * - Required fields: title, deadline.
 * - Deadline must be in the future (ahead of current time).
 *
 * Props:
 * - open: controls visibility
 * - onClose: closes modal
 * - onSubmit: submits TaskRequest payload
 * - initialValues: optional values for edit mode
 *
 * Return:
 * - JSX.Element
 */
const TaskFormModal: React.FC<Props> = ({ open, onClose, onSubmit, initialValues }) => {
  const [form] = Form.useForm<FormValues>();

  /**
   * Summary:
   * - Populate or reset the form when modal opens.
   *
   * Return:
   * - void
   */
  useEffect(() => {
    if (!open) return;

    if (initialValues) {
      form.setFieldsValue({
        title: initialValues.title ?? '',
        description: initialValues.description ?? '',
        priority: initialValues.priority,
        status: initialValues.status,
        deadline: initialValues.deadline ? dayjs(initialValues.deadline) : dayjs().add(1, 'hour'),
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        // sensible defaults (optional fields)
        priority: 'LOW',
        status: 'PENDING',
        // default deadline is 1 hour ahead
        deadline: dayjs().add(1, 'hour'),
      });
    }
  }, [open, initialValues, form]);

  /**
   * Summary:
   * - Validates form then submits payload.
   *
   * Return:
   * - Promise<void>
   *
   * Possible exceptions:
   * - Throws validation errors if fields invalid.
   */
  const handleOk = async (): Promise<void> => {
    const values = await form.validateFields();

    const payload: TaskRequest = {
      title: values.title.trim(),
      description: values.description?.trim() || '',
      priority: values.priority,
      status: values.status,
      deadline: values.deadline.format('YYYY-MM-DDTHH:mm:ss'),
    };

    onSubmit(payload);
  };

  /**
   * Summary:
   * - Disables selecting past dates/times in DatePicker.
   *
   * Parameters:
   * - current: Dayjs | null
   *
   * Return:
   * - boolean (true means disabled)
   */
  const disabledDate = (current: Dayjs | null): boolean => {
    if (!current) return false;
    // disable any date before today
    return current.isBefore(dayjs().startOf('day'));
  };

  /**
   * Summary:
   * - Validates deadline is strictly in the future.
   *
   * Return:
   * - Promise<void>
   */
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
            showTime
            className="w-full"
            disabledDate={disabledDate}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default TaskFormModal;
