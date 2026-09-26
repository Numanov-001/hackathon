import type { Appearance } from "@clerk/react";

/** Clerk modal: email + password + Google, marketch.uz tokens, no Clerk marks. */
export const clerkAppearance: Appearance = {
  layout: {
    socialButtonsPlacement: "top",
    socialButtonsVariant: "blockButton",
    logoPlacement: "inside",
    unsafe_disableDevelopmentModeWarnings: true,
    showOptionalFields: true,
  },
  options: {
    socialButtonsPlacement: "top",
    socialButtonsVariant: "blockButton",
    unsafe_disableDevelopmentModeWarnings: true,
  },
  variables: {
    colorPrimary: "#146B43",
    colorText: "#1C2420",
    colorTextSecondary: "#4E5A54",
    colorBackground: "#FFFFFF",
    colorInputBackground: "#FFFFFF",
    colorInputText: "#1C2420",
    colorNeutral: "#4E5A54",
    borderRadius: "10px",
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
  },
  elements: {
    logoBox: { display: "none" },
    logoImage: { display: "none" },
    badge: { display: "none" },
    footerPages: { display: "none" },
    formFieldInput: {
      minHeight: "48px",
      borderRadius: "6px",
      borderColor: "#E0E3EB",
      fontSize: "14px",
    },
    formButtonPrimary: {
      minHeight: "48px",
      borderRadius: "6px",
      backgroundColor: "#146B43",
      fontSize: "14px",
      fontWeight: "600",
    },
    headerTitle: {
      fontSize: "20px",
      fontWeight: "600",
      color: "#1C2420",
    },
    headerSubtitle: {
      fontSize: "14px",
      color: "#4E5A54",
    },
    socialButtonsBlockButton: {
      minHeight: "48px",
      borderRadius: "6px",
      border: "1px solid #E0E3EB",
      background: "#FFFFFF",
      fontSize: "14px",
      fontWeight: "600",
      color: "#1C2420",
    },
    card: {
      borderRadius: "10px",
      boxShadow: "0 12px 32px rgba(22, 48, 40, 0.16)",
      border: "1px solid #E0E3EB",
    },
    modalContent: {
      boxShadow: "0 12px 32px rgba(22, 48, 40, 0.16)",
    },
  },
};
