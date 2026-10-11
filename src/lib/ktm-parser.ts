export interface ParsedKtmData {
  nim: string;
  fullName: string;
  major: string;
  faculty: string;
  status: 'AKTIF' | 'CUTI' | 'LULUS';
  confidence: number;
}

export function parseKtmText(rawText: string): ParsedKtmData {
  const lines = rawText
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  let nim = '';
  let fullName = '';
  let major = '';
  let faculty = 'Kampus UPI di Purwakarta';
  let nimIndex = -1;

  // 1. Find NIM (UPI 7-digit: starts with 1 or 2, followed by 6 digits)
  for (let i = 0; i < lines.length; i++) {
    const nimMatch = lines[i].match(/\b([12]\d{6})\b/);
    if (nimMatch) {
      nim = nimMatch[1];
      nimIndex = i;
      break;
    }
  }

  // Fallback NIM: any 7 digit number
  if (!nim) {
    for (let i = 0; i < lines.length; i++) {
      const nimMatch = lines[i].match(/\b(\d{7})\b/);
      if (nimMatch) {
        nim = nimMatch[1];
        nimIndex = i;
        break;
      }
    }
  }

  // 2. Find Full Name (Line immediately preceding NIM)
  const ignoredWords = ['UNIVERSITAS', 'PENDIDIKAN', 'INDONESIA', 'KARTU', 'TANDA', 'MAHASISWA', 'BARCODE'];
  if (nimIndex > 0) {
    for (let j = nimIndex - 1; j >= 0; j--) {
      const rawCandidate = lines[j]
        .replace(/[^a-zA-Z\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      const upper = rawCandidate.toUpperCase();
      const hasIgnored = ignoredWords.some((w) => upper.includes(w));
      if (!hasIgnored && rawCandidate.length >= 3) {
        // Strip common trailing artifacts from OCR (e.g., ' dl', ' id', ' il')
        const cleaned = rawCandidate.replace(/\b(dl|id|ii|il|di|al)\b/gi, '').trim();
        if (cleaned.length >= 3) {
          fullName = cleaned.toUpperCase();
          break;
        }
      }
    }
  }

  // Fallback: If not found before NIM, check all lines for names
  if (!fullName) {
    for (const line of lines) {
      const clean = line.replace(/[^a-zA-Z\s]/g, ' ').replace(/\s+/g, ' ').trim();
      const upper = clean.toUpperCase();
      const hasIgnored = ignoredWords.some((w) => upper.includes(w));
      if (!hasIgnored && clean.split(' ').length >= 2 && clean.length >= 6) {
        fullName = clean.toUpperCase();
        break;
      }
    }
  }

  // 3. Find Major (Jurusan / Program Studi)
  // Check the line right after NIM
  if (nimIndex >= 0 && nimIndex + 1 < lines.length) {
    const nextLine = lines[nimIndex + 1];
    if (!nextLine.includes('||') && !nextLine.toUpperCase().includes('UNIVERSITAS') && !nextLine.toUpperCase().includes('KAMPUS')) {
      major = nextLine.replace(/[^\w\s\(\)\-\.]/g, '').trim();
    }
  }

  // Fallback major search: lines containing (S1), (D3), (S2) or keywords
  if (!major) {
    for (let i = 0; i < lines.length; i++) {
      if (i === nimIndex) continue;
      const l = lines[i];
      if (/\((S1|D3|S2|D4)\)/i.test(l) || /(Mekatronika|Teknik|Pendidikan|Kecerdasan|Ilmu|Manajemen|Bisnis|Sastra|Informatika)/i.test(l)) {
        if (!ignoredWords.some((w) => l.toUpperCase().includes(w))) {
          major = l.replace(/[^\w\s\(\)\-\.]/g, '').trim();
          break;
        }
      }
    }
  }

  // 4. Find Faculty or Regional Campus (Kampus Purwakarta, Cibiru, Tasikmalaya, FPTK, etc.)
  for (let i = 0; i < lines.length; i++) {
    const upper = lines[i].toUpperCase();
    if (upper.includes('PURWAKARTA')) {
      faculty = 'Kampus UPI di Purwakarta';
      break;
    } else if (upper.includes('CIBIRU')) {
      faculty = 'Kampus UPI di Cibiru';
      break;
    } else if (upper.includes('TASIKMALAYA')) {
      faculty = 'Kampus UPI di Tasikmalaya';
      break;
    } else if (upper.includes('SUMEDANG')) {
      faculty = 'Kampus UPI di Sumedang';
      break;
    } else if (upper.includes('SERANG')) {
      faculty = 'Kampus UPI di Serang';
      break;
    } else if (upper.includes('FPTK') || upper.includes('TEKNOLOGI DAN KEJURUAN')) {
      faculty = 'FPTK - Fakultas Pendidikan Teknologi dan Kejuruan';
      break;
    } else if (upper.includes('FPMIPA') || upper.includes('MATEMATIKA')) {
      faculty = 'FPMIPA - Fakultas Pendidikan Matematika dan Ilmu Pengetahuan Alam';
      break;
    } else if (upper.includes('FPEB') || upper.includes('EKONOMI')) {
      faculty = 'FPEB - Fakultas Pendidikan Ekonomi dan Bisnis';
      break;
    } else if (upper.includes('FPIPS') || upper.includes('ILMU PENGETAHUAN SOSIAL')) {
      faculty = 'FPIPS - Fakultas Pendidikan Ilmu Pengetahuan Sosial';
      break;
    } else if (upper.includes('FPBS') || upper.includes('BAHASA')) {
      faculty = 'FPBS - Fakultas Pendidikan Bahasa dan Sastra';
      break;
    } else if (upper.includes('FIP') || upper.includes('ILMU PENDIDIKAN')) {
      faculty = 'FIP - Fakultas Ilmu Pendidikan';
      break;
    } else if (upper.includes('FPOK') || upper.includes('OLAHRAGA')) {
      faculty = 'FPOK - Fakultas Pendidikan Olahraga dan Kesehatan';
      break;
    } else if (upper.includes('FPSD') || upper.includes('SENI')) {
      faculty = 'FPSD - Fakultas Pendidikan Seni dan Desain';
      break;
    }
  }

  const confidence = (nim ? 40 : 0) + (fullName ? 30 : 0) + (major ? 30 : 0);

  return {
    nim: nim || '',
    fullName: fullName || '',
    major: major || '',
    faculty,
    status: 'AKTIF',
    confidence
  };
}
