import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { ClerkProvider, useAuth, useClerk, useUser } from "@clerk/react";
import { clerkAppearance } from "./pomidor/clerkAppearance";
import Dashboard from "./pomidor/Dashboard";
import AdminApp from "./pomidor/AdminApp";
import "./styles.css";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || "";

function ClerkApp() {
  const { isSignedIn, user } = useUser();
  const { getToken } = useAuth();
  const clerk = useClerk();
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const home = () => {
    window.history.pushState({}, "", "/");
    setPath("/");
  };

  const dashboard = (
    <Dashboard
      clerkEnabled
      isSignedIn={!!isSignedIn}
      userName={user?.fullName || user?.firstName || ""}
      userEmail={user?.primaryEmailAddress?.emailAddress || ""}
      userPicture={user?.imageUrl || ""}
      clerkUserId={user?.id || ""}
      openSignIn={() => clerk.openSignIn({ appearance: clerkAppearance })}
      getToken={getToken}
    />
  );

  if (path.startsWith("/admin")) {
    return isSignedIn ? <AdminApp path={path} getToken={getToken} onHome={home} /> : dashboard;
  }
  return dashboard;
}

function Root() {
  if (!PUBLISHABLE_KEY) {
    return (
      <Dashboard
        clerkEnabled={false}
        isSignedIn={false}
        userName=""
        userEmail=""
        userPicture=""
        clerkUserId=""
        openSignIn={() => {}}
      />
    );
  }

  return (
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      afterSignOutUrl="/"
      appearance={clerkAppearance}
    >
      <ClerkApp />
    </ClerkProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
);
