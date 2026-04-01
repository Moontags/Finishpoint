type MobilePayMode = "disabled" | "link" | "api";

const mobilePayPublicLink = process.env.NEXT_PUBLIC_MOBILEPAY_PAYMENT_LINK?.trim() ?? "";

export function getMobilePayPublicLink() {
  return mobilePayPublicLink;
}

export function getMobilePayMode(): MobilePayMode {
  if (mobilePayPublicLink) {
    return "link";
  }

  const hasServerCredentials = Object.keys(process.env).some((key) => key.startsWith("MOBILEPAY_"));

  if (hasServerCredentials) {
    return "api";
  }

  return "disabled";
}