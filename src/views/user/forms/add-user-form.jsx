import React, { Component } from "react";
import { Form, Input, Modal } from "antd";
const { TextArea } = Input;
class AddUserForm extends Component {
  validatUserID = (rule, value, callback) => {
    if (value) {
      if (!/^[a-zA-Z0-9]{1,6}$/.test(value)) {
        callback("用户ID必须为1-6位数字或字母组合");
      }
    } else {
      callback("请输入用户ID");
    }
    callback();
  };
  render() {
    const { visible, onCancel, onOk, form, confirmLoading } = this.props;
    const { getFieldDecorator } = form;
    return (
      <Modal
        title="添加用户"
        visible={visible}
        onCancel={onCancel}
        onOk={onOk}
        confirmLoading={confirmLoading}
        width={500}
      >
        <Form layout="vertical">
          <Form.Item label="账号">
            {getFieldDecorator("id", {
              rules: [{ required: true, validator: this.validatUserID }],
            })(<Input placeholder="请输入账号" />)}
          </Form.Item>
          <Form.Item label="用户名称">
            {getFieldDecorator("name", {
              rules: [{ required: true, message: "请输入用户名称!" }],
            })(<Input placeholder="请输入用户名称" />)}
          </Form.Item>
          <Form.Item label="用户描述">
            {getFieldDecorator("description", {
            })(<TextArea rows={4} placeholder="请输入用户描述" />)}
          </Form.Item>
        </Form>
      </Modal>
    );
  }
}

export default Form.create({ name: "AddUserForm" })(AddUserForm);
