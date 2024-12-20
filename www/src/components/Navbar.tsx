import { Menu } from "antd";
import styles from "./Navbar.module.css";
import { useLocation, useNavigate } from "react-router";
import { getActiveRouteName, PathDef } from "gena-app";
import React from "react";
import logo from "../logo.png";

type MenuItemProps = {
  label: string | JSX.Element;
  icon?: JSX.Element;
  danger?: boolean;
  disabled?: boolean;
};

interface Props<R> {
  menus: Partial<Record<keyof R, MenuItemProps>>;
  routes: R;
  className?: string;
  style?: React.CSSProperties;
  isFirstItemLogo?: boolean;
}
type Component = <R extends Record<any, PathDef<any, any>>>(_p: Props<R>) => JSX.Element;

export const LeftNavBar = (<R extends Record<any, PathDef<any, any>>>({ menus, routes, className, style, isFirstItemLogo }: Props<R>) => {
  const location = useLocation();
  const navigate = useNavigate();

  const openMenu = (e: { key: keyof R }) => {
    routes[e.key].path({ urlArgs: {}, queryArgs: {} }).open(navigate);
  };

  const items = Object.keys(menus).map((routeName, index) => {
    const item = menus[routeName]!;

    if (isFirstItemLogo === true && index === 0) {
      return {
        key: routeName,
        ...item,
        label: (
          <a className={styles.logo}>
            <img src={logo} alt="logo" />
            {item.label}
          </a>
        ),
      };
    }
    return {
      key: routeName,
      ...item,
    };
  });
  const activeRouteName = getActiveRouteName(location, routes);

  return (
    <Menu
      mode="horizontal"
      className={styles.leftNavBar + (className !== undefined ? " " + className : "")}
      style={style}
      onClick={openMenu}
      selectedKeys={activeRouteName !== undefined ? [activeRouteName] : undefined}
      items={items}
    ></Menu>
  );
}) as Component;
