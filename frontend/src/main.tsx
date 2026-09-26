import React from "react";
import ReactDOM from "react-dom/client";
import { ClerkProvider, useClerk, useUser } from "@clerk/react";
import { clerkAppearance } from "./pomidor/clerkAppearance";
import Dashboard from "./pomidor/Dashboard";
import "./styles.css";

const PUBLISHABLE_KEY =
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ||
  "pk_test_YWRhcHRpbmctZHJha2UtNzk4NC5jbGVyay5hY2NvdW50cy5kZXYk";

function ClerkApp() {
  const { isSignedIn, user } = useUser();
  const clerk = useClerk();
  return (
    <Dashboard
      clerkEnabled
      isSignedIn={!!isSignedIn}
      userName={user?.fullName || user?.firstName || ""}
      userEmail={user?.primaryEmailAddress?.emailAddress || ""}
      userPicture={user?.imageUrl || ""}
      openSignIn={() => clerk.openSignIn({ appearance: clerkAppearance })}
    />
  );
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
