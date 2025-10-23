"use client";

import { useEffect, useMemo, useState } from "react";
import { usePublicClient } from "wagmi";
import { formatEther } from "viem";

import { CONTRACTS } from "@/lib/contracts";
import { ipfsToHttp } from "@/lib/ipfsService";

interface RawProjectResult {
  id?: bigint;
  creator?: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  category?: string;
  goal?: bigint;
  deadline?: bigint;
  fundsRaised?: bigint;
  claimed?: boolean;
  cofounders?: readonly string[];
  nftContract?: string;
  [key: number]: unknown;
}

export interface UserNFTCardData {
  id: string;
  projectId: number;
  projectTitle: string;
  projectCategory: string;
  contractAddress: `0x${string}`;
  tokenId: bigint;
  tokenLabel: string;
  investmentWei: bigint;
  investmentEth: string;
  metadataUri: string;
  metadataHttpUrl: string;
  metadataName: string;
  metadataDescription: string;
  imageUrl: string;
}

interface UseUserNFTsResult {
  nfts: UserNFTCardData[];
  isLoading: boolean;
  error: string | null;
}

const NFT_IMAGE_FALLBACK =
  "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?w=800&q=80&fm=jpg&fit=crop";

const isNonZeroAddress = (value: unknown): value is `0x${string}` =>
  typeof value === "string" && value.length === 42 && value !== "0x0000000000000000000000000000000000000000";

export function useUserNFTs(userAddress?: `0x${string}`): UseUserNFTsResult {
  const publicClient = usePublicClient();
  const [nfts, setNfts] = useState<UserNFTCardData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const normalizedAddress = useMemo(() => userAddress?.toLowerCase() as `0x${string}` | undefined, [userAddress]);

  useEffect(() => {
    const client = publicClient;

    if (!client || !normalizedAddress) {
      setNfts([]);
      return;
    }

    let cancelled = false;

    async function loadUserNFTs() {
      setIsLoading(true);
      setError(null);

      if (!client) return;

      try {
        const totalProjectsBigInt = (await client.readContract({
          address: CONTRACTS.launchpad.address,
          abi: CONTRACTS.launchpad.abi,
          functionName: "projectCount",
        })) as bigint;

        const totalProjects = Number(totalProjectsBigInt ?? 0);
        if (cancelled) return;

        if (!Number.isFinite(totalProjects) || totalProjects === 0) {
          setNfts([]);
          setIsLoading(false);
          return;
        }

        type MulticallContract = Parameters<
          typeof client.multicall
        >[0]["contracts"][number];

        const projectCalls: MulticallContract[] = Array.from({ length: totalProjects }, (_, index) => ({
          address: CONTRACTS.launchpad.address,
          abi: CONTRACTS.launchpad.abi,
          functionName: "getProject",
          args: [BigInt(index)],
        }));

        const projectResults = await client.multicall({
          contracts: projectCalls as readonly { abi: any; functionName: string; args?: readonly unknown[] | undefined; address: `0x${string}`; }[],
          allowFailure: true,
        });

        if (cancelled) return;

        type ProjectNFTSource = {
          projectId: number;
          title: string;
          category: string;
          nftAddress: `0x${string}`;
        };

        const projectSources: ProjectNFTSource[] = projectResults
          .map((entry, index) => {
            if (!entry || entry.status !== "success" || !entry.result) return null;

            const data = entry.result as RawProjectResult;

            const nftAddressCandidate =
              (data.nftContract as string | undefined) ?? ((data[11] as string | undefined) ?? "");

            if (!isNonZeroAddress(nftAddressCandidate)) return null;

            const title =
              (data.title as string | undefined) ??
              ((data[2] as string | undefined) ?? `Project #${index}`);

            const category =
              (data.category as string | undefined) ??
              ((data[5] as string | undefined) ?? "Project");

            return {
              projectId: index,
              title,
              category,
              nftAddress: nftAddressCandidate as `0x${string}`,
            };
          })
          .filter(Boolean) as ProjectNFTSource[];

        if (projectSources.length === 0) {
          setNfts([]);
          setIsLoading(false);
          return;
        }

        const tokenCalls: MulticallContract[] = projectSources.map((source) => ({
          address: source.nftAddress,
          abi: CONTRACTS.projectNFT.abi,
          functionName: "tokensOfOwner",
          args: [normalizedAddress],
        }));

        const tokenResults = await client.multicall({
          contracts: tokenCalls as readonly { abi: any; functionName: string; args?: readonly unknown[] | undefined; address: `0x${string}`; }[],
          allowFailure: true,
        });

        if (cancelled) return;

        const aggregated: UserNFTCardData[] = [];

        for (let i = 0; i < projectSources.length; i++) {
          const source = projectSources[i];
          const tokensEntry = tokenResults[i];

          if (!tokensEntry || tokensEntry.status !== "success" || !tokensEntry.result) {
            continue;
          }

          const ownedTokenIds = tokensEntry.result as bigint[];
          if (!Array.isArray(ownedTokenIds) || ownedTokenIds.length === 0) {
            continue;
          }

          // Fetch metadata URI (same for all tokens in this contract)
          let metadataUri = "";
          try {
            metadataUri = (await client.readContract({
              address: source.nftAddress,
              abi: CONTRACTS.projectNFT.abi,
              functionName: "tokenURI",
              args: [ownedTokenIds[0]],
            })) as string;
          } catch (tokenUriError) {
            console.error("Error fetching tokenURI", tokenUriError);
          }

          let metadataName = `${source.title} Backer NFT`;
          let metadataDescription = "";
          let imageUrl = NFT_IMAGE_FALLBACK;
          const metadataHttpUrl = metadataUri ? ipfsToHttp(metadataUri) : "";

          if (metadataUri) {
            try {
              const metadataResponse = await fetch(metadataHttpUrl || metadataUri);
              if (metadataResponse.ok) {
                const metadataJson = await metadataResponse.json();
                const nameCandidate = (metadataJson?.name as string | undefined)?.trim();
                const descriptionCandidate = (metadataJson?.description as string | undefined)?.trim();
                const imageCandidate = (metadataJson?.image as string | undefined)?.trim();

                if (nameCandidate) {
                  metadataName = nameCandidate;
                }
                if (descriptionCandidate) {
                  metadataDescription = descriptionCandidate;
                }
                if (imageCandidate) {
                  imageUrl = ipfsToHttp(imageCandidate);
                }
              }
            } catch (fetchError) {
              console.warn("Unable to fetch NFT metadata:", fetchError);
            }
          }

          // Fetch per-token investment amounts
          for (const tokenId of ownedTokenIds) {
            let investmentWei = BigInt(0);
            try {
              investmentWei = (await client.readContract({
                address: source.nftAddress,
                abi: CONTRACTS.projectNFT.abi,
                functionName: "getInvestmentAmount",
                args: [tokenId],
              })) as bigint;
            } catch (investmentError) {
              console.warn("Unable to fetch investment amount:", investmentError);
            }

            const investmentEth = formatEther(investmentWei);
            aggregated.push({
              id: `${source.nftAddress}-${tokenId.toString()}`,
              projectId: source.projectId,
              projectTitle: source.title,
              projectCategory: source.category,
              contractAddress: source.nftAddress,
              tokenId,
              tokenLabel: tokenId.toString(),
              investmentWei,
              investmentEth,
              metadataUri,
              metadataHttpUrl,
              metadataName,
              metadataDescription,
              imageUrl,
            });
          }
        }

        if (!cancelled) {
          const sorted = aggregated.sort((a, b) => {
            if (a.projectId !== b.projectId) {
              return b.projectId - a.projectId;
            }
            return b.tokenId > a.tokenId ? 1 : -1;
          });
          setNfts(sorted);
        }
      } catch (loadError) {
        console.error("Failed to load user NFTs:", loadError);
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Unexpected error loading NFTs");
          setNfts([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadUserNFTs();

    return () => {
      cancelled = true;
    };
  }, [publicClient, normalizedAddress]);

  return { nfts, isLoading, error };
}
