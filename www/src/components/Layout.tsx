import React, { useEffect, useMemo } from "react";
import { Layout as AntDLayout, Menu, Space } from "antd";
import { RequiredAuthentication, Role } from "./RequiredAuthentication";
import logo from "../logo.png";
import styles from "./Layout.module.css";
import { useLocation, useNavigate } from "react-router";
import { getActiveRouteName, PathDef } from "gena-app";
import { ProfileMenu } from "../components/ProfileMenu";
const { Header, Content, Footer } = AntDLayout;

export interface ExtendedRoute {
  name?: string;
  route: PathDef<any, any>;
  role: Role;
}

export const NavBar = <R extends Record<any, PathDef<any, any>>>({ className, routes, items }: { className: string; routes: R; items: { key: string; label: string }[] }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const activeRouteName = getActiveRouteName(location, routes);
  const openMenu = (e: { key: keyof R }) => {
    routes[e.key].path({ urlArgs: {}, queryArgs: {} }).open(navigate);
  };

  return <Menu mode="horizontal" items={items} className={styles.menu} onClick={openMenu} selectedKeys={activeRouteName !== undefined ? [activeRouteName] : undefined} />;
};

export const Layout = ({
  component,
  name,
  routes,
  extendedRoutes,
}: {
  component: React.FunctionComponent<any> | React.ComponentClass<any, any>;
  name: string;
  routes: Record<string, PathDef<any, any>>;
  extendedRoutes: Record<string, ExtendedRoute>;
}) => {
  const items = Object.entries(extendedRoutes)
    .filter(([key, value]) => value.name !== undefined)
    .map(([key, value]) => {
      return {
        key: key,
        label: value.name!,
      };
    });
  return (props: any) => {
    let element = React.createElement(component, props);
    if (extendedRoutes[name].role != Role.Public) {
      element = <RequiredAuthentication role={extendedRoutes[name].role}>{element}</RequiredAuthentication>;
    }
    return (
      <AntDLayout style={{ background: "white" }}>
        <Header className={styles.header}>
          <a className={styles.logo} href="/">
            <img src={logo} alt="logo" />
            <span>MinMod</span>
          </a>
          <NavBar className={styles.menu} routes={routes} items={items} />
          <ProfileMenu />
        </Header>

        <Content className={"wide-container"} style={{ marginTop: 16, minHeight: "calc(100vh - 64px - 16px - 64px)" }}>
          {element}
        </Content>

        <Footer style={{ textAlign: "center", height: 64 }}>
          © 2023 - {new Date().getFullYear()}, <a href="https://isi.edu/">USC Information Sciences Institute</a>
        </Footer>
      </AntDLayout>
    );
  };
};
