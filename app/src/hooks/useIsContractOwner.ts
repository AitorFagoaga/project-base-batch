import { useAccount, useReadContract } from "wagmi";
import { CONTRACTS } from "@/lib/contracts";

/**
 * Custom hook to check if the connected wallet is the contract owner
 *
 * @returns {Object} Object containing:
 *  - isOwner: boolean - true if connected address is the contract owner
 *  - isLoading: boolean - true while fetching owner data
 *  - owner: Address | undefined - the contract owner address
 *
 * @example
 * const { isOwner, isLoading } = useIsContractOwner();
 *
 * if (isLoading) return <div>Loading...</div>;
 * if (isOwner) return <AdminPanel />;
 * return <AccessDenied />;
 */
export function useIsContractOwner() {
  const { address } = useAccount();

  // Fetch the contract owner (used for gating Admin page)
  const { data: owner, isLoading } = useReadContract({
    address: CONTRACTS.reputation.address,
    abi: CONTRACTS.reputation.abi,
    functionName: "owner",
  });

  const isOwner = !!address && !!owner && address.toLowerCase() === (owner as string).toLowerCase();

  return {
    isOwner,
    isLoading,
    owner,
  };
}
