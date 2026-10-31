import {
  PublicClientApplication,
  type AuthenticationResult,
  type Configuration,
} from "@azure/msal-browser";

const LOGIN_SCOPES = ["openid", "profile", "email"];

let pca: PublicClientApplication | null = null;
let initPromise: Promise<PublicClientApplication> | null = null;

function getClientId(): string | undefined {
  const id = import.meta.env.VITE_MICROSOFT_CLIENT_ID as string | undefined;
  return id?.trim() || undefined;
}

function getTenant(): string {
  const tenant = (import.meta.env.VITE_MICROSOFT_TENANT as string | undefined)?.trim();
  return tenant || "common";
}

export function isMicrosoftLoginConfigured(): boolean {
  return Boolean(getClientId());
}

async function getMsal(): Promise<PublicClientApplication> {
  const clientId = getClientId();
  if (!clientId) {
    throw new Error("Microsoft sign-in is not configured for this build.");
  }

  if (pca) return pca;
  if (initPromise) return initPromise;

  const config: Configuration = {
    auth: {
      clientId,
      authority: `https://login.microsoftonline.com/${getTenant()}`,
      redirectUri: window.location.origin,
      postLogoutRedirectUri: window.location.origin,
    },
    cache: {
      cacheLocation: "sessionStorage",
    },
  };

  initPromise = (async () => {
    const instance = new PublicClientApplication(config);
    await instance.initialize();
    pca = instance;
    return instance;
  })();

  try {
    return await initPromise;
  } catch (err) {
    initPromise = null;
    pca = null;
    throw err;
  }
}

/**
 * Opens the Microsoft login popup and returns the ID token for API verification.
 */
export async function acquireMicrosoftIdToken(): Promise<string> {
  const instance = await getMsal();
  let result: AuthenticationResult;

  try {
    result = await instance.loginPopup({
      scopes: LOGIN_SCOPES,
      prompt: "select_account",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    if (/user_cancelled|user cancelled|popup_window_error/i.test(message)) {
      throw new Error("Microsoft sign-in was cancelled.");
    }
    throw new Error(message || "Microsoft sign-in failed.");
  }

  if (!result.idToken) {
    throw new Error("Microsoft did not return an ID token.");
  }

  return result.idToken;
}
