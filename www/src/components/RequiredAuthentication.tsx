import { observer } from "mobx-react-lite";
import { ReactElement, useEffect } from "react";
import { useStores } from "models";
import { routes } from "routes";
import { useNavigate } from "react-router";

export enum Role {
  User,
  Public,
}

export const RequiredAuthentication = observer(({ children, role }: { children: ReactElement; role: Role }) => {
  const { userStore } = useStores();
  const navigate = useNavigate();

  // check & login if not logged in
  useEffect(() => {
    userStore.isLoggedIn().then((isLoggedIn) => {
      if (!isLoggedIn) {
        routes.login.path().open(navigate);
      }
    });
  }, [userStore, navigate]);

  return children;
});
