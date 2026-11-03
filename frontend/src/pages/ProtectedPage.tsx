import { useEffect } from "react";
import { Outlet, useLoaderData } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import type { AuthUser } from "./types/auth";

function ProtectedPage() {
  const loadedUser = useLoaderData<AuthUser>();
  const { setUser } = useAuth();
  useEffect(() => {
    setUser(loadedUser);
  }, [loadedUser, setUser]);

  return (
      <Outlet />
  );
}

export default ProtectedPage;
