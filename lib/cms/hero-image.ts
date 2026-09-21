/** Formato panorámico tipo hero: sujeto a la derecha, espacio a la izquierda (~2.3:1). */
export const HERO_IMAGE_MIN_RATIO = 2;
export const HERO_IMAGE_MIN_WIDTH = 1024;
export const HERO_IMAGE_RECOMMENDED_WIDTH = 1920;
export const HERO_IMAGE_RECOMMENDED_HEIGHT = 850;

export const HERO_IMAGE_SPECS_LABEL = `${HERO_IMAGE_RECOMMENDED_WIDTH}×${HERO_IMAGE_RECOMMENDED_HEIGHT}px`;

export type ImageDimensions = {
  width: number;
  height: number;
};

export function isHeroBannerImage(
  width: number,
  height: number,
): boolean {
  if (!width || !height) return false;
  if (width < HERO_IMAGE_MIN_WIDTH) return false;
  return width / height >= HERO_IMAGE_MIN_RATIO;
}

export function heroBannerImageError(width: number, height: number): string {
  const ratio = height ? (width / height).toFixed(2) : "0";
  return (
    `La imagen no cumple el formato del hero. Mide ${width}×${height}px ` +
    `(proporción ${ratio}:1). Debe ser panorámica horizontal: mínimo ` +
    `${HERO_IMAGE_MIN_WIDTH}px de ancho y al menos el doble de ancha que de alta ` +
    `(recomendado ${HERO_IMAGE_SPECS_LABEL}, proporción ~2.3:1), con el sujeto a la derecha.`
  );
}

export function readImageDimensions(file: File): Promise<ImageDimensions> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      const width = img.naturalWidth;
      const height = img.naturalHeight;
      URL.revokeObjectURL(url);
      if (!width || !height) {
        reject(new Error("No se pudo leer el tamaño de la imagen."));
        return;
      }
      resolve({ width, height });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("No se pudo leer la imagen seleccionada."));
    };
    img.src = url;
  });
}

export function loadImageDimensions(src: string): Promise<ImageDimensions> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => {
      const width = img.naturalWidth;
      const height = img.naturalHeight;
      if (!width || !height) {
        reject(new Error("No se pudo leer el tamaño de la imagen."));
        return;
      }
      resolve({ width, height });
    };
    img.onerror = () => {
      reject(new Error("No se pudo cargar la imagen."));
    };
    img.src = src;
  });
}

export async function assertHeroBannerImageFile(
  file: File,
): Promise<ImageDimensions> {
  const dims = await readImageDimensions(file);
  if (!isHeroBannerImage(dims.width, dims.height)) {
    throw new Error(heroBannerImageError(dims.width, dims.height));
  }
  return dims;
}

/** @deprecated use isHeroBannerImage */
export const isLandscapeImage = isHeroBannerImage;
/** @deprecated use heroBannerImageError */
export const landscapeImageError = heroBannerImageError;
/** @deprecated use assertHeroBannerImageFile */
export const assertLandscapeImageFile = assertHeroBannerImageFile;
