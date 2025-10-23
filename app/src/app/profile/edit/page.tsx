"use client";

import { useState, useEffect } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { CONTRACTS } from "@/lib/contracts";
import { NetworkGuard } from "@/components/NetworkGuard";
import { SharedPageLayout } from "@/components/SharedPageLayout";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function EditProfilePage() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [errors, setErrors] = useState<{ name?: string; description?: string; avatarUrl?: string }>({});

  // Get current profile
  const { data: profileData, isLoading } = useReadContract({
    address: CONTRACTS.userProfile.address,
    abi: CONTRACTS.userProfile.abi,
    functionName: "getProfile",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  // Load existing profile data
  useEffect(() => {
    if (profileData) {
      // Handle both array and object formats
      if (Array.isArray(profileData)) {
        const profile = {
          name: profileData[0] as string,
          description: profileData[1] as string,
          avatarUrl: profileData[2] as string,
          exists: profileData[3] as boolean,
        };

        if (profile.exists) {
          setName(profile.name);
          setDescription(profile.description);
          setAvatarUrl(profile.avatarUrl);
        }
      } else {
        const profile = profileData as any;
        if (profile.exists) {
          setName(profile.name || '');
          setDescription(profile.description || '');
          setAvatarUrl(profile.avatarUrl || '');
        }
      }
    }
  }, [profileData]);

  // Write contract
  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (isSuccess) {
      toast.success("Profile updated successfully! 🎉");
      setTimeout(() => {
        router.push(`/profile/${address}`);
      }, 2000);
    }
  }, [isSuccess, router, address]);

  useEffect(() => {
    if (writeError) {
      toast.error("Error updating profile");
      console.error(writeError);
    }
  }, [writeError]);

  const validate = (): boolean => {
    const newErrors: { name?: string; description?: string; avatarUrl?: string } = {};

    if (!name.trim()) {
      newErrors.name = "Name is required";
    } else if (name.length > 50) {
      newErrors.name = "Name cannot exceed 50 characters";
    }

    if (description.length > 500) {
      newErrors.description = "Description cannot exceed 500 characters";
    }

    if (avatarUrl.length > 200) {
      newErrors.avatarUrl = "URL cannot exceed 200 characters";
    }

    if (avatarUrl && !avatarUrl.startsWith("http")) {
      newErrors.avatarUrl = "URL must start with http:// or https://";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      toast.error("Please correct the errors in the form");
      return;
    }

    try {
      writeContract({
        address: CONTRACTS.userProfile.address,
        abi: CONTRACTS.userProfile.abi,
        functionName: "setProfile",
        args: [name.trim(), description.trim(), avatarUrl.trim()],
      });

      toast.success("Transaction sent. Waiting for confirmation...");
    } catch (error) {
      console.error("Error submitting transaction:", error);
      toast.error("Error sending transaction");
    }
  };

  return (
    <SharedPageLayout
      title="Edit Your Profile"
      description="Update your profile information on the blockchain"
    >
      <NetworkGuard>
        {!address ? (
          <div className="card text-center py-16">
            <div className="text-6xl mb-6">🔒</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Connect Your Wallet
            </h3>
            <p className="text-gray-700 mb-6">
              You need to connect your wallet to edit your profile
            </p>
            <p className="text-sm text-gray-600">
              Click &quot;Connect Wallet&quot; in the top right corner
            </p>
          </div>
        ) : isLoading ? (
          <div className="card text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading profile...</p>
          </div>
        ) : (
          <div className="card">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Link
                  href={`/profile/${address}`}
                  className="text-indigo-600 hover:text-indigo-700 text-sm font-medium inline-flex items-center gap-1"
                >
                  ← Back to profile
                </Link>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                ✏️ Edit Profile
              </h2>
              <p className="text-gray-600">
                Update your profile information. Changes will be saved to the blockchain.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Field */}
              <div>
                <label htmlFor="name" className="input-label">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`input ${errors.name ? "border-red-500" : ""}`}
                  placeholder="Your name or alias"
                  maxLength={50}
                  disabled={isPending || isConfirming}
                />
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-red-500">{errors.name}</span>
                  <span className="text-xs text-gray-500">{name.length}/50</span>
                </div>
              </div>

              {/* Description Field */}
              <div>
                <label htmlFor="description" className="input-label">
                  Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={`input min-h-[120px] ${errors.description ? "border-red-500" : ""}`}
                  placeholder="Tell us about you, your skills, interests..."
                  maxLength={500}
                  disabled={isPending || isConfirming}
                />
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-red-500">{errors.description}</span>
                  <span className="text-xs text-gray-500">{description.length}/500</span>
                </div>
              </div>

              {/* Avatar URL Field */}
              <div>
                <label htmlFor="avatarUrl" className="input-label">
                  Avatar URL
                </label>
                <input
                  type="url"
                  id="avatarUrl"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className={`input ${errors.avatarUrl ? "border-red-500" : ""}`}
                  placeholder="https://example.com/your-avatar.jpg"
                  maxLength={200}
                  disabled={isPending || isConfirming}
                />
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-red-500">{errors.avatarUrl}</span>
                  <span className="text-xs text-gray-500">{avatarUrl.length}/200</span>
                </div>

                {/* Image Preview */}
                {avatarUrl && avatarUrl.startsWith("http") && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                    <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-indigo-500">
                      <img
                        src={avatarUrl}
                        alt="Avatar preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={isPending || isConfirming}
                  className="flex-1 rounded-lg bg-indigo-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPending || isConfirming ? (
                    <>
                      <span className="inline-block animate-spin mr-2">⏳</span>
                      {isPending ? "Confirming..." : "Saving..."}
                    </>
                  ) : (
                    "💾 Save Changes"
                  )}
                </button>

                <Link
                  href={`/profile/${address}`}
                  className="flex-1 rounded-lg bg-gray-100 px-6 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-200 text-center"
                >
                  Cancel
                </Link>
              </div>

              {/* Transaction Hash */}
              {hash && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800 mb-2 font-medium">
                    Transaction sent:
                  </p>
                  <a
                    href={`https://sepolia.basescan.org/tx/${hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline break-all"
                  >
                    {hash}
                  </a>
                </div>
              )}

              {/* Info Message */}
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  ℹ️ <strong>Note:</strong> Changes require a blockchain transaction.
                  Make sure you have enough ETH on Base Sepolia to pay for gas.
                </p>
              </div>
            </form>
          </div>
        )}
      </NetworkGuard>
    </SharedPageLayout>
  );
}
