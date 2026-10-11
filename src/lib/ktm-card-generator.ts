// High-Resolution Digital KTM (Student ID) Card Canvas Generator

export interface KtmCardParams {
  fullName: string;
  nim: string;
  university?: string;
  faculty?: string;
  avatarUrl?: string;
  status?: string;
  theme?: 'ui' | 'itb' | 'ugm' | 'default';
}

export async function generateDigitalKtmCard(params: KtmCardParams): Promise<string> {
  const {
    fullName,
    nim,
    university = 'UNIVERSITAS PENDIDIKAN INDONESIA',
    faculty = 'FPTK - Teknik Mesin',
    avatarUrl,
    status = 'MAHASISWA AKTIF'
  } = params;

  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const width = 850;
    const height = 530; // standard CR80 ID Card aspect ratio ~ 1.6
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      resolve('');
      return;
    }

    // 1. Base Background Gradient (UPI Crimson Maroon & Dark Slate)
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#4c0519');
    bgGrad.addColorStop(0.35, '#881337');
    bgGrad.addColorStop(0.7, '#1e1b4b');
    bgGrad.addColorStop(1, '#0f172a');

    // Rounded rectangle clipping for the card
    const radius = 28;
    ctx.beginPath();
    ctx.moveTo(radius, 0);
    ctx.lineTo(width - radius, 0);
    ctx.quadraticCurveTo(width, 0, width, radius);
    ctx.lineTo(width, height - radius);
    ctx.quadraticCurveTo(width, height, width - radius, height);
    ctx.lineTo(radius, height);
    ctx.quadraticCurveTo(0, height, 0, height - radius);
    ctx.lineTo(0, radius);
    ctx.quadraticCurveTo(0, 0, radius, 0);
    ctx.closePath();
    ctx.clip();

    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Guilloche Security Wave Pattern
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
    ctx.lineWidth = 1.2;
    for (let i = 0; i < 20; i++) {
      ctx.beginPath();
      ctx.moveTo(0, 100 + i * 22);
      ctx.bezierCurveTo(
        width * 0.25, 80 + i * 26 + Math.sin(i) * 20,
        width * 0.75, 120 + i * 18 - Math.cos(i) * 25,
        width, 90 + i * 24
      );
      ctx.stroke();
    }

    // 3. Top Banner & University Branding
    const topGrad = ctx.createLinearGradient(0, 0, width, 0);
    topGrad.addColorStop(0, '#0284c7');
    topGrad.addColorStop(0.5, '#4f46e5');
    topGrad.addColorStop(1, '#7c3aed');
    ctx.fillStyle = topGrad;
    ctx.fillRect(0, 0, width, 105);

    // Decorative gold stripe
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(0, 105, width, 5);

    // University Seal / Crest Monogram
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(60, 52, 32, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.fill();
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Emblem Icon Text
    ctx.font = 'bold 24px sans-serif';
    ctx.fillStyle = '#fef08a';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🎓', 60, 52);

    // University Name
    ctx.textAlign = 'left';
    ctx.font = '900 24px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(university.toUpperCase(), 110, 44);

    ctx.font = '600 13px sans-serif';
    ctx.fillStyle = '#bae6fd';
    ctx.fillText('KARTU TANDA MAHASISWA ELEKTRONIK (E-KTM)', 110, 72);

    // RFID / Contactless Wave Icon on Top Right
    ctx.textAlign = 'right';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillStyle = '#f8fafc';
    ctx.fillText('CAMPUSQUEST IDENTITY', width - 40, 44);
    ctx.font = 'bold 11px sans-serif';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('SECURE SMART ID • VERIFIED', width - 40, 68);

    // 4. Gold EMV Smartcard Chip
    const chipX = 50;
    const chipY = 145;
    const chipW = 75;
    const chipH = 58;

    const chipGrad = ctx.createLinearGradient(chipX, chipY, chipX + chipW, chipY + chipH);
    chipGrad.addColorStop(0, '#fbbf24');
    chipGrad.addColorStop(0.5, '#f59e0b');
    chipGrad.addColorStop(1, '#d97706');

    ctx.fillStyle = chipGrad;
    ctx.beginPath();
    ctx.roundRect(chipX, chipY, chipW, chipH, 8);
    ctx.fill();
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Chip internal circuit pattern
    ctx.strokeStyle = 'rgba(120, 53, 15, 0.6)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(chipX + 25, chipY);
    ctx.lineTo(chipX + 25, chipY + chipH);
    ctx.moveTo(chipX + 50, chipY);
    ctx.lineTo(chipX + 50, chipY + chipH);
    ctx.moveTo(chipX, chipY + chipH / 2);
    ctx.lineTo(chipX + chipW, chipY + chipH / 2);
    ctx.stroke();

    // 5. Hologram Seal Badge
    ctx.save();
    const holoGrad = ctx.createLinearGradient(width - 150, 140, width - 50, 240);
    holoGrad.addColorStop(0, 'rgba(56, 189, 248, 0.25)');
    holoGrad.addColorStop(0.5, 'rgba(236, 72, 153, 0.25)');
    holoGrad.addColorStop(1, 'rgba(168, 85, 247, 0.25)');
    ctx.fillStyle = holoGrad;
    ctx.beginPath();
    ctx.arc(width - 90, 190, 48, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.font = 'bold 11px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText('ORIGINAL', width - 90, 185);
    ctx.font = 'bold 9px sans-serif';
    ctx.fillStyle = '#fde047';
    ctx.fillText('VALID KTM', width - 90, 202);
    ctx.restore();

    // 6. Student Avatar / Photo Box
    const photoX = 50;
    const photoY = 225;
    const photoW = 160;
    const photoH = 205;

    // Draw photo placeholder or load real image
    const renderContent = (loadedImg?: HTMLImageElement) => {
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(photoX, photoY, photoW, photoH, 14);
      ctx.clip();

      if (loadedImg) {
        ctx.drawImage(loadedImg, photoX, photoY, photoW, photoH);
      } else {
        // Fallback photo
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(photoX, photoY, photoW, photoH);
        ctx.font = 'bold 50px sans-serif';
        ctx.fillStyle = '#64748b';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('👤', photoX + photoW / 2, photoY + photoH / 2);
      }
      ctx.restore();

      // Photo border
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(photoX, photoY, photoW, photoH, 14);
      ctx.stroke();

      // 7. Student Information Text Block
      const textX = 240;

      // Label Nama
      ctx.textAlign = 'left';
      ctx.font = '600 11px sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('NAMA MAHASISWA', textX, 160);

      ctx.font = 'bold 22px sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(fullName.toUpperCase(), textX, 188);

      // Label NIM
      ctx.font = '600 11px sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('NOMOR INDUK MAHASISWA (NIM)', textX, 225);

      ctx.font = '900 24px monospace';
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(nim, textX, 254);

      // Label Fakultas / Prodi
      ctx.font = '600 11px sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('FAKULTAS / PROGRAM STUDI', textX, 290);

      ctx.font = 'bold 15px sans-serif';
      ctx.fillStyle = '#f1f5f9';
      ctx.fillText(faculty, textX, 314);

      // Status Badge
      const badgeY = 350;
      ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
      ctx.beginPath();
      ctx.roundRect(textX, badgeY, 190, 36, 10);
      ctx.fill();
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.6)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.font = 'bold 12px sans-serif';
      ctx.fillStyle = '#34d399';
      ctx.fillText(`● STATUS: ${status}`, textX + 16, badgeY + 23);

      // 8. Barcode Rendering at Bottom Right
      const barX = width - 260;
      const barY = 380;
      const barW = 220;
      const barH = 50;

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(barX - 10, barY - 8, barW + 20, barH + 28, 8);
      ctx.fill();

      // Fake barcode vertical lines
      ctx.fillStyle = '#0f172a';
      let currentBx = barX;
      for (let b = 0; b < 45; b++) {
        const thickness = (b % 3 === 0 || b % 5 === 0) ? 4 : 2;
        const gap = (b % 4 === 0) ? 4 : 2.5;
        if (currentBx + thickness <= barX + barW) {
          ctx.fillRect(currentBx, barY, thickness, barH);
        }
        currentBx += thickness + gap;
      }

      ctx.font = 'bold 11px monospace';
      ctx.fillStyle = '#0f172a';
      ctx.textAlign = 'center';
      ctx.fillText(`*${nim}*`, barX + barW / 2, barY + barH + 14);

      // 9. Card Bottom Footer / Watermark note
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.fillRect(0, height - 42, width, 42);

      ctx.textAlign = 'left';
      ctx.font = '600 11px sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('CampusQuest • Ekosistem Terverifikasi Mahasiswa', 30, height - 16);

      ctx.textAlign = 'right';
      ctx.font = 'italic 11px sans-serif';
      ctx.fillStyle = '#38bdf8';
      ctx.fillText('Valid for Campus P2P Services (JASTAP & JARVIS)', width - 30, height - 16);

      // Outer border highlight
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(1, 1, width - 2, height - 2, radius);
      ctx.stroke();

      resolve(canvas.toDataURL('image/jpeg', 0.9));
    };

    if (avatarUrl) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => renderContent(img);
      img.onerror = () => renderContent();
      img.src = avatarUrl;
    } else {
      renderContent();
    }
  });
}
