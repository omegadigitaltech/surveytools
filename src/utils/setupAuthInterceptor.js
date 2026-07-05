import { toast } from "react-toastify";
import useAuthStore from "../store/useAuthStore";

const setupAuthInterceptor = (router) => {
  const originalFetch = window.fetch.bind(window);
  let redirecting = false;

  window.fetch = async (...args) => {
    const response = await originalFetch(...args);

    if (
      response.status === 401 &&
      useAuthStore.getState().isAuthenticated &&
      !redirecting
    ) {
      redirecting = true;
      useAuthStore.getState().logout();
      toast.error("Your session has expired. Please sign in again.", {
        toastId: "session-expired",
      });
      router.navigate("/signin", { replace: true });
    }

    return response;
  };

  return () => {
    window.fetch = originalFetch;
  };
};

export default setupAuthInterceptor;
