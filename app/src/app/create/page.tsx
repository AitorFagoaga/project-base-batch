"use client";

import { useEffect, useMemo, useState } from "react";
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";
import { parseEther } from "viem";

import { CONTRACTS } from "@/lib/contracts";
import { NetworkGuard } from "@/components/NetworkGuard";
import { SharedPageLayout } from "@/components/SharedPageLayout";
import { Icon } from "@/components/Icon";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1200&q=80";

export default function CreateProjectPage() {
  const router = useRouter();
  const { isConnected, address } = useAccount();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [category, setCategory] = useState("DeFi");
  const [goalEth, setGoalEth] = useState("");
  const [durationDays, setDurationDays] = useState("");

  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (!isSuccess) {
      return;
    }

    toast.success("🎉 Project created successfully! Redirecting...", {
      duration: 3000,
      icon: "🚀",
    });

    const redirect = setTimeout(() => router.push("/"), 2000);
    return () => clearTimeout(redirect);
  }, [isSuccess, router]);

  const previewImage = imageUrl.trim() || FALLBACK_IMAGE;
  const goalLabel = goalEth ? `${goalEth} ETH` : "Set your goal";
  const durationLabel = durationDays
    ? `${durationDays} day${durationDays === "1" ? "" : "s"}`
    : "Select duration";

  const descriptionPreview =
    description.trim() ||
    "Share your project's vision, what you'll build, and why your reputation backs this campaign.";

  const cofounderHint = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : "0xYourWallet";

  const handleQuickAmount = (amount: string) => {
    setGoalEth(amount);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!title || !goalEth || !durationDays) {
      toast.error("Please complete all required fields");
      return;
    }

    const goal = Number(goalEth);
    const duration = Number(durationDays);

    if (Number.isNaN(goal) || goal <= 0) {
      toast.error("Goal must be greater than 0");
      return;
    }

    if (!Number.isInteger(duration) || duration <= 0 || duration > 365) {
      toast.error("Duration must be between 1 and 365 days");
      return;
    }

    if (title.length > 100) {
      toast.error("Title must be 100 characters or less");
      return;
    }

    if (description.length > 1000) {
      toast.error("Description must be 1000 characters or less");
      return;
    }

    if (imageUrl.length > 200) {
      toast.error("Image URL must be 200 characters or less");
      return;
    }

    try {
      const goalInWei = parseEther(goalEth);

      writeContract({
        address: CONTRACTS.launchpad.address,
        abi: CONTRACTS.launchpad.abi,
        functionName: "createProject",
        args: [title, description, imageUrl, category, goalInWei, BigInt(duration)],
      });

      toast.success("📝 Transaction sent to MetaMask");
    } catch (submitError) {
      console.error("Create project error:", submitError);
      const errorMessage = submitError instanceof Error ? submitError.message : String(submitError);

      if (errorMessage.includes("User rejected") || errorMessage.includes("User denied")) {
        toast.error("❌ Transaction canceled in MetaMask", { duration: 4000 });
      } else if (errorMessage.includes("insufficient funds")) {
        toast.error("💰 Insufficient funds for gas", { duration: 4000 });
      } else if (errorMessage.toLowerCase().includes("gas")) {
        toast.error("⛽ Gas error - try increasing the limit", { duration: 4000 });
      } else {
        toast.error(`❌ Error: ${errorMessage.substring(0, 80)}`, { duration: 5000 });
      }
    }
  };

  const quickAmounts = useMemo(() => ["0.01", "0.05", "0.1"], []);

  return (
    <SharedPageLayout
      title="Launch Your Project"
      description="Set up your reputation-backed campaign in minutes. Define the key details and launch when ready."
    >
      <NetworkGuard>
        {!isConnected ? (
          <div className="card text-center py-16 animate-fadeIn">
            <div className="text-6xl mb-6">🔐</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Connect your wallet
            </h3>
            <p className="text-gray-600 mb-6 text-lg">
              You need to connect your wallet to create a project.
            </p>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              Your on-chain reputation backs the trust of your sponsors.
            </p>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr),minmax(260px,1fr)]">
            <form onSubmit={handleSubmit} className="card space-y-8" noValidate>
              <div className="rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50/80 to-purple-50/80 p-5">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-blue-600">
                  All-or-nothing funding
                </h3>
                <p className="text-gray-700 mt-2 text-sm leading-relaxed">
                  Funds are only released if you reach your goal before the deadline. This protects your
                  sponsors and demonstrates the seriousness of the campaign.
                </p>
              </div>

              <section className="space-y-5">
                <header className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Project Information
                  </h3>
                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Step 1 of 2
                  </span>
                </header>

                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label htmlFor="title" className="input-label text-base flex items-center gap-2">
                      <Icon name="edit" size="sm" />
                      Project Title *
                    </label>
                    <input
                      id="title"
                      type="text"
                      value={title}
                      onChange={(event) => setTitle(event.target.value)}
                      placeholder="Build a decentralized social network"
                      className="input-field text-base"
                      disabled={isPending || isConfirming}
                      maxLength={100}
                      required
                    />
                    <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                      <span>Use a clear and specific title.</span>
                      <span className={title.length > 90 ? "font-semibold text-orange-600" : ""}>
                        {title.length}/100
                      </span>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="category" className="input-label text-base flex items-center gap-2">
                      <Icon name="tag" size="sm" />
                      Category *
                    </label>
                    <select
                      id="category"
                      value={category}
                      onChange={(event) => setCategory(event.target.value)}
                      className="input-field text-base"
                      disabled={isPending || isConfirming}
                      required
                    >
                      <option value="DeFi">DeFi</option>
                      <option value="NFT">NFT & Collectibles</option>
                      <option value="Gaming">Gaming</option>
                      <option value="Social">Social</option>
                      <option value="Infrastructure">Infrastructure</option>
                      <option value="Education">Education</option>
                      <option value="Impact">Impact</option>
                      <option value="Other">Other</option>
                    </select>
                    <p className="mt-2 text-xs text-gray-500">
                      Choose the category that best fits your project.
                    </p>
                  </div>
                </div>

                <div>
                  <label htmlFor="imageUrl" className="input-label text-base flex items-center gap-2">
                    <Icon name="image" size="sm" />
                    Cover Image
                  </label>
                  <input
                    id="imageUrl"
                    type="url"
                    value={imageUrl}
                    onChange={(event) => setImageUrl(event.target.value)}
                    placeholder="https://... or ipfs://..."
                    className="input-field text-base"
                    disabled={isPending || isConfirming}
                    maxLength={200}
                  />
                  <p className="mt-2 text-xs text-gray-500">
                    Optional, but helps tell your project&apos;s story.
                  </p>
                </div>

                <div>
                  <label htmlFor="description" className="input-label text-base flex items-center gap-2">
                    <Icon name="edit" size="sm" />
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="Describe what you'll build, why it matters, and how you'll use the funds."
                    className="input-field text-base min-h-[140px] resize-y"
                    disabled={isPending || isConfirming}
                    maxLength={1000}
                    rows={5}
                  />
                  <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                    <span>Maximum 1000 characters.</span>
                    <span className={description.length > 900 ? "font-semibold text-orange-600" : ""}>
                      {description.length}/1000
                    </span>
                  </div>
                </div>
              </section>

              <section className="space-y-5">
                <header className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Goals and Duration
                  </h3>
                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Step 2 of 2
                  </span>
                </header>

                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label htmlFor="goal" className="input-label text-base flex items-center gap-2">
                      <Icon name="coins" size="sm" />
                      Funding Goal (ETH) *
                    </label>
                    <div className="relative">
                      <input
                        id="goal"
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={goalEth}
                        onChange={(event) => setGoalEth(event.target.value)}
                        placeholder="1.00"
                        className="input-field text-base pr-16"
                        disabled={isPending || isConfirming}
                        required
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-500">
                        ETH
                      </span>
                    </div>
                    <div className="mt-3 grid gap-2 sm:grid-cols-3">
                      {quickAmounts.map((amount) => (
                        <button
                          key={amount}
                          type="button"
                          onClick={() => handleQuickAmount(amount)}
                          className={`rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
                            goalEth === amount
                              ? "border-blue-500 bg-blue-500 text-white"
                              : "border-blue-200 bg-white/70 text-blue-700 hover:border-blue-400 hover:bg-blue-50"
                          }`}
                          disabled={isPending || isConfirming}
                        >
                          {amount} ETH
                        </button>
                      ))}
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      Set an achievable goal; you can expand it in future campaigns.
                    </p>
                  </div>

                  <div>
                    <label htmlFor="duration" className="input-label text-base">
                      ⏰ Campaign Duration (days) *
                    </label>
                    <input
                      id="duration"
                      type="number"
                      min="1"
                      max="365"
                      value={durationDays}
                      onChange={(event) => setDurationDays(event.target.value)}
                      placeholder="30"
                      className="input-field text-base"
                      disabled={isPending || isConfirming}
                      required
                    />
                    <p className="mt-2 text-xs text-gray-500">
                      Maximum allowed is 365 days. We recommend between 21 and 45 days.
                    </p>
                  </div>
                </div>
              </section>

              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50/80 p-4 animate-fadeIn">
                  <p className="text-sm font-semibold text-red-800">
                    Transaction Error
                  </p>
                  <p className="text-sm text-red-700 mt-1">
                    {error.message.includes("User rejected") || error.message.includes("User denied")
                      ? "You canceled the transaction in your wallet. Try again when ready."
                      : error.message.includes("insufficient funds")
                      ? "You don't have enough ETH to complete this transaction."
                      : error.message.substring(0, 160)}
                  </p>
                </div>
              )}

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-gray-600">
                  Review the data before submitting the transaction. You can edit the campaign from the dashboard if needed.
                </p>
                <button
                  type="submit"
                  disabled={isPending || isConfirming}
                  className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2"
                >
                  {isPending || isConfirming ? (
                    "Processing..."
                  ) : (
                    <>
                      <Icon name="rocket" size="sm" />
                      Create Project
                    </>
                  )}
                </button>
              </div>
            </form>

            <aside className="glass-card rounded-2xl lg:sticky lg:top-28 space-y-8 p-8">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-1 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
                  <h3 className="text-xl font-bold text-gray-900">Live Preview</h3>
                </div>
                <p className="text-sm text-gray-600">
                  See how your campaign will appear in the listing before launch.
                </p>
              </div>

              <div className="group overflow-hidden rounded-2xl border-2 border-gray-200/80 bg-white shadow-lg transition-all hover:shadow-xl hover:border-blue-300/60">
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-gradient-to-br from-purple-100 via-blue-50 to-pink-100">
                  <Image
                    src={previewImage}
                    alt="Project preview"
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    priority={false}
                    sizes="(min-width: 1024px) 340px, 100vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <div className="space-y-4 p-6">
                  <div className="space-y-2">
                    <h4 className="text-xl font-bold text-gray-900 leading-tight">
                      {title || "Your project doesn't have a title yet"}
                    </h4>
                    <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
                      {descriptionPreview}
                    </p>
                  </div>
                  
                  <div className="rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100">
                        <span className="text-sm">👤</span>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-indigo-600">Creator</p>
                        <p className="font-mono text-sm font-semibold text-indigo-900">{cofounderHint}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3 rounded-xl bg-gray-50/80 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Goal</span>
                      <span className="text-base font-bold text-gray-900">{goalLabel}</span>
                    </div>
                    <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Duration</span>
                      <span className="text-base font-bold text-gray-900">{durationLabel}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 p-6 space-y-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="text-xl">💡</span>
                  <h4 className="text-sm font-bold uppercase tracking-wide text-purple-700">
                    Quick Tips
                  </h4>
                </div>
                <ul className="space-y-3 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 mt-0.5">✓</span>
                    <span>Outline clear milestones and how the budget will be used.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 mt-0.5">✓</span>
                    <span>Share your reputation or past achievements to build trust.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 mt-0.5">✓</span>
                    <span>Prepare weekly updates for your sponsors.</span>
                  </li>
                </ul>
              </div>
            </aside>
          </div>
        )}
      </NetworkGuard>
    </SharedPageLayout>
  );
}
