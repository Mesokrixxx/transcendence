import { useEffect } from "react";
import { Outlet, useLoaderData } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { AuthUser } from "../types/auth";
import GameInvitationNotifications from "../components/Notifications/GameInvitationNotifications";

function ProtectedPage() {
  const loadedUser = useLoaderData<AuthUser | null>();
  const { setUser } = useAuth();
  useEffect(() => {
    setUser(loadedUser);
  }, [loadedUser, setUser]);

  return (
    <>
      <GameInvitationNotifications />
      <Outlet />
    </>
  );
}

export default ProtectedPage;
