// Helper functions for managing event images in localStorage

export function saveEventImage(eventId: number, imageUrl: string): void {
  if (typeof window === "undefined" || !imageUrl.trim()) return;
  
  try {
    const imagesData = localStorage.getItem("event_images");
    const images = imagesData ? JSON.parse(imagesData) : {};
    images[eventId] = imageUrl.trim();
    localStorage.setItem("event_images", JSON.stringify(images));
  } catch (e) {
    console.error("Error saving event image", e);
  }
}

export function getEventImage(eventId: number): string | null {
  if (typeof window === "undefined") return null;
  
  try {
    const imagesData = localStorage.getItem("event_images");
    if (imagesData) {
      const images = JSON.parse(imagesData);
      return images[eventId] || null;
    }
  } catch (e) {
    console.error("Error loading event image", e);
  }
  return null;
}

export function removeEventImage(eventId: number): void {
  if (typeof window === "undefined") return;
  
  try {
    const imagesData = localStorage.getItem("event_images");
    if (imagesData) {
      const images = JSON.parse(imagesData);
      delete images[eventId];
      localStorage.setItem("event_images", JSON.stringify(images));
    }
  } catch (e) {
    console.error("Error removing event image", e);
  }
}
