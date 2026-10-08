// Automatic Canvas Watermark for KTM Verification (Page 8 Specification)

export async function addKtmWatermark(
  fileOrBase64: File | string,
  nim: string = 'MAHASISWA'
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      // Max size bounding box for performance and compression
      const maxDim = 1200;
      let width = img.width;
      let height = img.height;

      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      canvas.width = width;
      canvas.height = height;

      // Draw original image
      ctx.drawImage(img, 0, 0, width, height);

      // Add watermark overlay
      ctx.save();
      const text = 'HANYA UNTUK VERIFIKASI AKUN CAMPUS QUEST';
      const subText = `NIM: ${nim} • ${new Date().toLocaleDateString('id-ID')}`;

      // Calculate angle and spacing
      const angle = -Math.PI / 6; // -30 degrees
      ctx.translate(width / 2, height / 2);
      ctx.rotate(angle);

      // Watermark Styling
      ctx.font = `bold ${Math.max(20, Math.floor(width / 24))}px sans-serif`;
      ctx.fillStyle = 'rgba(239, 68, 68, 0.45)'; // semi-transparent red/rose
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Repeating watermark pattern
      const stepY = Math.floor(height / 4);
      for (let y = -height; y <= height; y += stepY) {
        ctx.fillStyle = 'rgba(239, 68, 68, 0.40)';
        ctx.fillText(text, 0, y);
        ctx.font = `italic ${Math.max(14, Math.floor(width / 36))}px sans-serif`;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.45)';
        ctx.fillText(subText, 0, y + 26);
        ctx.font = `bold ${Math.max(20, Math.floor(width / 24))}px sans-serif`;
      }

      ctx.restore();

      // Top-Left Security Badge Overlay
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.fillRect(16, 16, Math.min(320, width - 32), 48);
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('🔒 VERIFIKASI IDENTITAS RESMI', 28, 36);
      ctx.fillStyle = '#ffffff';
      ctx.font = '11px sans-serif';
      ctx.fillText('CampusQuest Protected Document', 28, 52);

      // Export as compressed WebP or JPEG
      const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
      resolve(compressedDataUrl);
    };

    img.onerror = () => {
      reject(new Error('Failed to load image for watermarking'));
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
