"use client";

import { ConnectButton as RainbowConnectButton } from "@rainbow-me/rainbowkit";

/**
 * Wallet connect button using RainbowKit
 */
export function ConnectButton() {
  return (
    <RainbowConnectButton
      chainStatus="icon"
      accountStatus="address"
      showBalance={false}
    />
  );
}
