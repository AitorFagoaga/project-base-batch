/**
 * IPFS Service for uploading images and metadata to Pinata
 *
 * Setup:
 * 1. Sign up at https://pinata.cloud
 * 2. Create an API key (JWT)
 * 3. Add to .env.local:
 *    NEXT_PUBLIC_PINATA_JWT=your_jwt_here
 *    NEXT_PUBLIC_PINATA_GATEWAY=your_gateway_url (e.g., gateway.pinata.cloud)
 */

interface PinataUploadResponse {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
}

interface NFTMetadata {
  name: string;
  description: string;
  image: string;
}

/**
 * Upload a file (image) to Pinata IPFS
 * @param file The file to upload
 * @returns IPFS URI in the format ipfs://Qm...
 */
export async function uploadImageToIPFS(file: File): Promise<string> {
  const jwt = process.env.NEXT_PUBLIC_PINATA_JWT;

  if (!jwt) {
    throw new Error("NEXT_PUBLIC_PINATA_JWT is not configured. Please add your Pinata JWT to .env.local");
  }

  const formData = new FormData();
  formData.append("file", file);

  // Optional: Add metadata about the file
  const metadata = JSON.stringify({
    name: file.name,
  });
  formData.append("pinataMetadata", metadata);

  // Optional: Add options
  const options = JSON.stringify({
    cidVersion: 1,
  });
  formData.append("pinataOptions", options);

  try {
    const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Pinata upload failed: ${response.statusText}. ${JSON.stringify(errorData)}`);
    }

    const data: PinataUploadResponse = await response.json();
    return `ipfs://${data.IpfsHash}`;
  } catch (error) {
    console.error("Error uploading image to IPFS:", error);
    throw error;
  }
}

/**
 * Upload NFT metadata JSON to Pinata IPFS
 * @param metadata The NFT metadata object
 * @returns IPFS URI in the format ipfs://Qm...
 */
export async function uploadMetadataToIPFS(metadata: NFTMetadata): Promise<string> {
  const jwt = process.env.NEXT_PUBLIC_PINATA_JWT;

  if (!jwt) {
    throw new Error("NEXT_PUBLIC_PINATA_JWT is not configured. Please add your Pinata JWT to .env.local");
  }

  const data = JSON.stringify({
    pinataContent: metadata,
    pinataMetadata: {
      name: `${metadata.name} - NFT Metadata`,
    },
    pinataOptions: {
      cidVersion: 1,
    },
  });

  try {
    const response = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
      body: data,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Pinata JSON upload failed: ${response.statusText}. ${JSON.stringify(errorData)}`);
    }

    const result: PinataUploadResponse = await response.json();
    return `ipfs://${result.IpfsHash}`;
  } catch (error) {
    console.error("Error uploading metadata to IPFS:", error);
    throw error;
  }
}

/**
 * Convert an IPFS URI to an HTTP gateway URL for display
 * @param ipfsUri IPFS URI (e.g., ipfs://Qm...)
 * @returns HTTP URL (e.g., https://gateway.pinata.cloud/ipfs/Qm...)
 */
export function ipfsToHttp(ipfsUri: string): string {
  if (!ipfsUri.startsWith("ipfs://")) {
    return ipfsUri; // Already an HTTP URL or different format
  }

  const gateway = process.env.NEXT_PUBLIC_PINATA_GATEWAY || "gateway.pinata.cloud";
  const hash = ipfsUri.replace("ipfs://", "");
  return `https://${gateway}/ipfs/${hash}`;
}

/**
 * Validate that an image file is acceptable
 * @param file The file to validate
 * @returns Error message if invalid, null if valid
 */
export function validateImageFile(file: File): string | null {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];

  if (!allowedTypes.includes(file.type)) {
    return "Please upload a valid image file (JPEG, PNG, GIF, or WebP)";
  }

  if (file.size > maxSize) {
    return "Image file size must be less than 10MB";
  }

  return null;
}
