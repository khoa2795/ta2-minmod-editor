import { Avatar, Button, Col, List, Row, Typography } from "antd";
import { observer } from "mobx-react";
import React, { ReactElement, useEffect } from "react";
import { InternalLink } from "gena-app";
import { useStores } from "../models";
import { routes } from "../routes";

export const RequiredAuthentication = observer(({ children }: { children: ReactElement }) => {
  const { userStore } = useStores();

  // check & login if not logged in
  useEffect(() => {
    userStore.isLoggedIn().then((isLoggedIn) => {
      if (!isLoggedIn) {
        routes.login.path().open();
      }
    });
  }, [userStore]);

  return children;
});
