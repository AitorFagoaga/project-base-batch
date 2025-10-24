"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import { Icon } from "@/components/Icon";
import { useUserNFTs } from "@/hooks/useUserNFTs";

interface UserNFTGalleryProps {
  address: `0x${string}`;
  isOwnProfile: boolean;
}

const FALLBACK_CARD_IMAGE =
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80&fm=jpg&fit=crop";

interface NFTImageProps {
  src: string;
  alt: string;
  fallback?: string;
}

function NFTImage({ src, alt, fallback = FALLBACK_CARD_IMAGE }: NFTImageProps) {
  const [imageSrc, setImageSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      console.warn(`Failed to load NFT image: ${imageSrc}`);
      setHasError(true);
      setImageSrc(fallback);
    }
  };

  return (
    <Image
      src={imageSrc || fallback}
      alt={alt}
      fill
      className="object-cover transition-transform duration-500 group-hover:scale-105"
      sizes="(min-width: 1280px) 340px, (min-width: 768px) 300px, 100vw"
      onError={handleError}
      unoptimized={imageSrc.includes("ipfs") || imageSrc.includes("pinata")}
    />
  );
}

function formatInvestmentLabel(value: string): string {
  const numeric = Number.parseFloat(value);
  if (!Number.isFinite(numeric)) {
    return value;
  }

  if (numeric >= 1) {
    return `${numeric.toLocaleString(undefined, { maximumFractionDigits: 2 })} ETH`;
  }

  if (numeric >= 0.001) {
    return `${numeric.toFixed(3)} ETH`;
  }

  return `${numeric.toFixed(6)} ETH`;
}

export function UserNFTGallery({ address, isOwnProfile }: UserNFTGalleryProps) {
  const { nfts, isLoading, error } = useUserNFTs(address);

  const sectionTitle = useMemo(
    () => (isOwnProfile ? "Your Backer NFTs" : "Backer NFTs"),
    [isOwnProfile]
  );

  const helperText = useMemo(
    () =>
      isOwnProfile
        ? "Every time you invest in a project, you receive a commemorative NFT with your investment amount."
        : "Explore the NFTs obtained by this user when backing projects on the platform.",
    [isOwnProfile]
  );

  if (isLoading) {
    return (
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Icon name="sparkles" size="lg" className="text-purple-500" />
              {sectionTitle}
            </h2>
            <p className="text-sm text-gray-500 mt-1">{helperText}</p>
          </div>
          <div className="rounded-full bg-purple-100 text-purple-700 text-xs font-semibold px-4 py-1">
            Loading...
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div
              key={idx}
              className="animate-pulse rounded-2xl border border-gray-100 bg-white/80 shadow-lg p-4 space-y-4"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-gray-200" />
              <div className="h-5 w-1/2 rounded-full bg-gray-200" />
              <div className="h-4 w-3/4 rounded-full bg-gray-100" />
              <div className="h-4 w-1/3 rounded-full bg-gray-100" />
              <div className="flex gap-3">
                <div className="h-9 flex-1 rounded-xl bg-gray-200" />
                <div className="h-9 w-24 rounded-xl bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-12 rounded-2xl border border-rose-200 bg-rose-50 px-6 py-5 text-rose-700">
        <div className="flex items-center gap-2 text-sm font-semibold mb-1">
          <Icon name="alert" size="sm" />
          We couldn&apos;t load the profile NFTs
        </div>
        <p className="text-sm text-rose-600/80">{error}</p>
      </div>
    );
  }

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Icon name="sparkles" size="lg" className="text-purple-500" />
            {sectionTitle}
          </h2>
          <p className="text-sm text-gray-500 mt-1">{helperText}</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="rounded-full bg-indigo-50 px-4 py-1.5 text-xs font-semibold text-indigo-600 border border-indigo-200">
            {nfts.length} NFT{nfts.length === 1 ? "" : "s"}
          </div>
        </div>
      </div>

      {nfts.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-indigo-200 bg-indigo-50/40 px-8 py-12 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
            <Icon name="sparkles" size="lg" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">
            No NFTs in this collection yet
          </h3>
          <p className="mt-2 text-sm text-gray-500 max-w-xl mx-auto">
            {isOwnProfile
              ? "Inspire or invest in projects to receive NFTs that reflect your support within the ecosystem."
              : "When this user backs projects, their NFTs will appear here."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {nfts.map((nft) => (
            <div
              key={nft.id}
              className="group overflow-hidden rounded-2xl border border-gray-100 bg-white/90 shadow-[0_18px_40px_-24px_rgba(99,102,241,0.4)] transition-all hover:-translate-y-1 hover:shadow-[0_30px_60px_-28px_rgba(99,102,241,0.55)]"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100">
                <NFTImage
                  src={nft.imageUrl || FALLBACK_CARD_IMAGE}
                  alt={nft.metadataName}
                  fallback={FALLBACK_CARD_IMAGE}
                />
                <div className="absolute inset-4 flex items-start justify-between">
                  <span className="rounded-full bg-white/85 px-3 py-1 text-xs font-semibold text-indigo-600 shadow">
                    #{nft.tokenLabel}
                  </span>
                  <span className="rounded-full bg-indigo-500/90 px-3 py-1 text-xs font-semibold text-white shadow">
                    {nft.projectCategory || "Launchpad"}
                  </span>
                </div>
              </div>

              <div className="p-4 space-y-3">
                <div>
                  <h3 className="text-base font-semibold text-gray-900 line-clamp-1">{nft.metadataName}</h3>
                  <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                    {nft.metadataDescription || `NFT obtenido al respaldar ${nft.projectTitle}`}
                  </p>
                </div>

                <div className="rounded-xl bg-gray-50/70 border border-gray-100 px-3 py-2 flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase text-gray-400 tracking-wide">Investment</p>
                    <p className="text-sm font-semibold text-indigo-600">
                      {formatInvestmentLabel(nft.investmentEth)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase text-gray-400 tracking-wide">Project</p>
                    <p className="text-xs font-semibold text-gray-700 line-clamp-1">
                      {nft.projectTitle}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/project/${nft.projectId}`}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-gray-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-indigo-600"
                  >
                    <Icon name="external" size="xs" />
                    View project
                  </Link>
                  {nft.metadataUri && (
                    <a
                      href={nft.metadataHttpUrl || nft.metadataUri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-100"
                      title="Ver metadata IPFS"
                    >
                      <Icon name="download" size="xs" />
                      Metadata
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
