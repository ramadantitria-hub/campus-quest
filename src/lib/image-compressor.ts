// Client-side Image Compression (Page 8 Specification)

export async function compressImage(
  fileOrBase64: File | string,
  maxWidth = 1000,
  maxHeight = 1000,
  quality = 0.75
): Promise<{ dataUrl: string; originalSizeKB: number; compressedSizeKB: number }> {
  return new Promise((resolve, reject) => {
    let originalSizeKB = 0;
    if (typeof fileOrBase64 !== 'string') {
      originalSizeKB = Math.round(fileOrBase64.size / 1024);
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width > maxWidth || height > maxHeight) {
        if (width / height > maxWidth / maxHeight) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      const head = 'data:image/jpeg;base64,';
      const compressedSizeKB = Math.round(((compressedDataUrl.length - head.length) * 3) / 4 / 1024);

      if (originalSizeKB === 0) {
        originalSizeKB = Math.round(compressedSizeKB * 1.8);
      }

      resolve({
        dataUrl: compressedDataUrl,
        originalSizeKB,
        compressedSizeKB
      });
    };

    img.onerror = () => {
      reject(new Error('Gagal memuat gambar untuk dikompres'));
    };

    if (typeof fileOrBase64 === 'string') {
      img.src = fileOrBase64;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(fileOrBase64);
    }
  });
}
