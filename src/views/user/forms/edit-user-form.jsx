import React, { Component } from "react";
import { Form, Input, Modal } from "antd";
const { TextArea } = Input;
class EditUserForm extends Component {
  render() {
    const {
      visible,
      onCancel,
      onOk,
      form,
      confirmLoading,
      currentRowData,
    } = this.props;
    const { getFieldDecorator } = form;
    const { username, name, description } = currentRowData;
    return (
      <Modal
        title="编辑用户"
        visible={visible}
        onCancel={onCancel}
        onOk={onOk}
        confirmLoading={confirmLoading}
        width={500}
      >
        <Form layout="vertical">
          <Form.Item label="账号">
            {getFieldDecorator("id", {
              initialValue: username,
            })(<Input disabled />)}
          </Form.Item>
          <Form.Item label="用户名称">
            {getFieldDecorator("name", {
              rules: [{ required: true, message: "请输入用户名称!" }],
              initialValue: name,
            })(<Input placeholder="请输入用户名称" />)}
          </Form.Item>
          <Form.Item label="用户描述">
            {getFieldDecorator("description", {
              initialValue: description,
            })(<TextArea rows={4} placeholder="请输入用户描述" />)}
          </Form.Item>
        </Form>
      </Modal>
    );
  }
}

export default Form.create({ name: "EditUserForm" })(EditUserForm);
