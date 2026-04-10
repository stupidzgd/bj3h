import React from "react";
import { Button, Row, Col } from "antd";
import errImg from "@/assets/images/404.png";
import "./index.less";

const NotFound = (props) => {
  const { history } = props;
  const goHome = () => history.replace("/");
  return (
    <Row className="not-found" type="flex" justify="center" align="middle">
      <Col xs={24} sm={24} md={12} lg={12} xl={12} className="image-container">
        <img src={errImg} alt="404" />
      </Col>
      <Col xs={24} sm={24} md={12} lg={12} xl={12} className="right">
        <h1>404</h1>
        <h2>抱歉，你访问的页面不存在</h2>
        <div>
          <Button type="primary" onClick={goHome}>
            回到首页
          </Button>
        </div>
      </Col>
    </Row>
  );
};

export default NotFound;
