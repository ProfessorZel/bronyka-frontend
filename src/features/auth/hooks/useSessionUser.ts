import { useContext } from "react";
import { AuthContext } from "../Authenticator";

export function useSessionUser() {
  const authCtx = useContext(AuthContext);
  return authCtx?.session?.user;
}
