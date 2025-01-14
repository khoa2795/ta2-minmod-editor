import React from "react";
import { Menu, Dropdown, Avatar, Button, MenuProps } from "antd";
import { useStores } from "models";
import { useNavigate } from "react-router";
import { UserOutlined, LogoutOutlined } from "@ant-design/icons";
import { observer } from "mobx-react-lite";

export const ProfileMenu: React.FC = observer(() => {
  const { userStore } = useStores();
  const navigate = useNavigate();
  const user = userStore.getCurrentUser();

  if (user === undefined) {
    return <></>;
  }
  const menu: MenuProps["items"] = [
    {
      key: "logout",
      label: "Logout",
      icon: <LogoutOutlined />,
    },
  ];

  const handleMenuClick = (e: { key: string }) => {
    if (e.key === "logout") {
      userStore.logout();
      navigate("/login");
    }
  };

  return (
    <Dropdown menu={{ items: menu, onClick: handleMenuClick }} placement="bottomRight" trigger={["click"]}>
      <Button type="text" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <Avatar icon={<UserOutlined />} style={{ backgroundColor: "#1890ff", verticalAlign: "middle" }} />
        {user.name}
      </Button>
    </Dropdown>
  );
});
