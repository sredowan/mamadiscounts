import type { PromotionPlacement } from "@/lib/promotion-store";

const PROMOTION_IMAGE_SIZES: Record<PromotionPlacement, { width: number; height: number }> = {
  main_banner: { width: 1600, height: 600 },
  sponsored_voucher: { width: 560, height: 320 },
};

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read image"));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not load image"));
    image.src = src;
  });
}

export async function normalizePromotionImage(file: File, placement: PromotionPlacement) {
  const src = await readFileAsDataUrl(file);
  const image = await loadImage(src);
  const target = PROMOTION_IMAGE_SIZES[placement];
  const canvas = document.createElement("canvas");
  canvas.width = target.width;
  canvas.height = target.height;

  const context = canvas.getContext("2d");
  if (!context) return src;

  const sourceRatio = image.width / image.height;
  const targetRatio = target.width / target.height;
  let sourceWidth = image.width;
  let sourceHeight = image.height;
  let sourceX = 0;
  let sourceY = 0;

  if (sourceRatio > targetRatio) {
    sourceWidth = image.height * targetRatio;
    sourceX = (image.width - sourceWidth) / 2;
  } else {
    sourceHeight = image.width / targetRatio;
    sourceY = (image.height - sourceHeight) / 2;
  }

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, target.width, target.height);

  return canvas.toDataURL("image/jpeg", 0.9);
}

export function getPromotionImageSizeLabel(placement: PromotionPlacement) {
  const { width, height } = PROMOTION_IMAGE_SIZES[placement];
  return `${width} x ${height}px`;
}
