import { PathDef, NoArgsPathDef, NoURLArgsPathDef, applyLayout } from "gena-app";
import { HomePage, LoginPage } from "./pages";

import React, { useEffect } from "react";
import { LeftNavBar } from "./components/Navbar";
import { Space } from "antd";

import { RequiredAuthentication } from "./components/RequiredAuthentication";
import { PUBLIC_URL } from "./env";

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
            home: {
              label: <span>MinMod Editor</span>,
            },
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
    pathDef: `${PUBLIC_URL}/login`,
    exact: true,
  }),
  home: new NoURLArgsPathDef({
    component: HomePage,
    pathDef: `${PUBLIC_URL}/`,
    exact: true,
    querySchema: {
      commodity: "optionalstring",
    },
  }),
};
(window as any)._routes = routes;

// apply this layout to all routes except login
applyLayout(routes, Layout, ["login"]);
