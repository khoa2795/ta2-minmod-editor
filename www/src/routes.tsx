import { PathDef, NoArgsPathDef, NoQueryArgsPathDef, applyLayout } from "gena-app";
import { HomePage, LoginPage } from "./pages";

import React, { useEffect } from "react";
import { LeftNavBar } from "./components/Navbar";
import { Space } from "antd";
import logo from "./logo.png";

import { CloudUploadOutlined, ProjectOutlined, SettingOutlined } from "@ant-design/icons";
import { useStores } from "./models";
import { RequiredAuthentication } from "components/RequiredAuthentication";

/*************************************************************************************
 * Layouts of the application
 */
export const Layout = (component: React.FunctionComponent<any> | React.ComponentClass<any, any>) => {
  return (props: any) => {
    const element = React.createElement(component, props);

    return (
      <Space direction="vertical" style={{ width: "100%" }}>
        <LeftNavBar
          menus={{
            home: <span>MinMod Editor</span>,
          }}
          routes={routes}
          isFirstItemLogo={true}
        />
        <RequiredAuthentication>
          <div className="wide-container">{element}</div>
        </RequiredAuthentication>
      </Space>
    );
  };
};

const None = () => <h1>Not supposed to see this page</h1>;

/*************************************************************************************
 * Definitions for routes in this application
 */
export const routes = {
  login: new NoArgsPathDef({
    component: LoginPage,
    pathDef: "/login",
    exact: true,
  }),
  home: new NoArgsPathDef({ component: HomePage, pathDef: "/", exact: true }),
};
(window as any)._routes = routes;

// apply this layout to all routes except login
applyLayout(routes, Layout, ["login"]);
