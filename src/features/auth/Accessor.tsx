import { Navigate } from "react-router";
import { useSessionUser } from "./hooks/useSessionUser";

interface AccessorProps {
  children?: React.ReactNode;
}

export function Accessor({ children }: AccessorProps) {
  const userData = useSessionUser();

  if (userData && userData.is_superuser) {
    return children;
  }

  return <Navigate to="/" replace />;
}
