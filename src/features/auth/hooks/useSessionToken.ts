import { useContext } from "react";
import { AuthContext } from "../Authenticator";

export function useSessionToken() {
  const authCtx = useContext(AuthContext);
  return authCtx?.session?.accessToken;
}
