import React, { useEffect } from 'react';
import { Form, Input, Modal, Select, DatePicker } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { TaskRequest } from '../types/task';

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: TaskRequest) => void;
  initialValues?: TaskRequest;
}

/**
 * TaskForm Component
 *
 * Reusable modal form for creating and editing tasks.
 */
const TaskForm: React.FC<Props> = ({ open, onClose, onSubmit, initialValues }) => {
  const [form] = Form.useForm();

  // Populate form when modal opens
  useEffect(() => {
    if (open) {
      if (initialValues) {
        form.setFieldsValue({
          ...initialValues,
          // Convert ISO string to dayjs object
          deadline: initialValues.deadline ? dayjs(initialValues.deadline) : undefined,
        });
      } else {
        form.resetFields();
      }
    }
  }, [open, initialValues, form]);

  // Handle form submission
  const handleFinish = (values: any) => {
  const payload: TaskRequest = {
    ...values,
    deadline: values.deadline
      ? values.deadline.format('YYYY-MM-DDTHH:mm:ss')  
      : null
  };

  onSubmit(payload);
};

  return (
    <Modal
      title={initialValues ? 'Edit Task' : 'Create Task'}
      open={open}
      onCancel={onClose}
      onOk={() => form.submit()}
      okText={initialValues ? 'Update' : 'Create'}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        preserve={false}
      >
        <Form.Item
          label="Title"
          name="title"
          rules={[{ required: true, message: 'Task title should not be empty' }]}
        >
          <Input placeholder="Enter task title" />
        </Form.Item>

        <Form.Item label="Description" name="description">
          <Input.TextArea placeholder="Enter task description" />
        </Form.Item>

        <Form.Item
          label="Priority"
          name="priority"
          rules={[{ required: true, message: 'Please select priority' }]}
        >
          <Select
  placeholder="Select priority"
  options={[
    { label: 'Low', value: 'LOW' },
    { label: 'Moderate', value: 'MODERATE' },
    { label: 'High', value: 'HIGH' },
  ]}
/>
        </Form.Item>

        <Form.Item
          label="Status"
          name="status"
          rules={[{ required: true, message: 'Please select status' }]}
        >
          <Select
  placeholder="Select status"
  options={[
    { label: 'Pending', value: 'PENDING' },
    { label: 'Completed', value: 'COMPLETED' },
  ]}
/>
        </Form.Item>

        <Form.Item
          label="Deadline"
          name="deadline"
          rules={[{ required: true, message: 'Please select deadline' }]}
        >
          <DatePicker showTime style={{ width: '100%' }} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default TaskForm;
