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

  // Prefer AccessControl ADMIN_ROLE if available on Reputation contract
  const { data: adminRole } = useReadContract({
    address: CONTRACTS.reputation.address,
    abi: CONTRACTS.reputation.abi,
    functionName: "ADMIN_ROLE",
  });

  const { data: hasAdminRole, isLoading: isLoadingAdmin } = useReadContract({
    address: CONTRACTS.reputation.address,
    abi: CONTRACTS.reputation.abi,
    functionName: "hasRole",
    args: [adminRole as any, address as any],
    query: { enabled: !!address && !!adminRole },
  });

  // Fallback to owner() if present (older deployments)
  const { data: owner, isLoading: isLoadingOwner } = useReadContract({
    address: CONTRACTS.reputation.address,
    abi: CONTRACTS.reputation.abi,
    functionName: "owner",
  });

  const isOwnerByRole = Boolean(hasAdminRole);
  const isOwnerByOwnerFn = !!address && !!owner && (address as string).toLowerCase() === (owner as string).toLowerCase();

  return {
    isOwner: isOwnerByRole || isOwnerByOwnerFn,
    isLoading: isLoadingAdmin || isLoadingOwner,
    owner,
  };
}
