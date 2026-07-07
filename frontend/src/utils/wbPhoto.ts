function basketNumber(vol: number): string {
  if (vol <= 143) return '01';
  if (vol <= 287) return '02';
  if (vol <= 431) return '03';
  if (vol <= 719) return '04';
  if (vol <= 1007) return '05';
  if (vol <= 1061) return '06';
  if (vol <= 1115) return '07';
  if (vol <= 1169) return '08';
  if (vol <= 1313) return '09';
  if (vol <= 1601) return '10';
  if (vol <= 1655) return '11';
  if (vol <= 1919) return '12';
  if (vol <= 2045) return '13';
  if (vol <= 2189) return '14';
  if (vol <= 2405) return '15';
  if (vol <= 2621) return '16';
  if (vol <= 2875) return '17';
  if (vol <= 3129) return '18';
  if (vol <= 3383) return '19';
  if (vol <= 3637) return '20';
  if (vol <= 3891) return '21';
  if (vol <= 4145) return '22';
  if (vol <= 4399) return '23';
  if (vol <= 4653) return '24';
  if (vol <= 4907) return '25';
  if (vol <= 5161) return '26';
  if (vol <= 5415) return '27';
  if (vol <= 5669) return '28';
  if (vol <= 5923) return '29';
  if (vol <= 6177) return '30';
  if (vol <= 6431) return '31';
  if (vol <= 6685) return '32';
  if (vol <= 6939) return '33';
  if (vol <= 7193) return '34';
  if (vol <= 7447) return '35';
  if (vol <= 7701) return '36';
  if (vol <= 7955) return '37';
  if (vol <= 8209) return '38';
  if (vol <= 8463) return '39';
  return '40';
}

function basketHosts(vol: number): string[] {
  const primary = Number(basketNumber(vol));
  const hosts: string[] = [];
  for (let delta = 0; delta <= 3; delta += 1) {
    for (const n of [primary - delta, primary + delta]) {
      if (n < 1 || n > 40) continue;
      const host = `basket-${String(n).padStart(2, '0')}.wbbasket.ru`;
      if (!hosts.includes(host)) hosts.push(host);
    }
  }
  return hosts;
}

const IMAGE_SIZES = ['c516x688', 'big', 'c246x328', 'tm'] as const;
const EXTENSIONS = ['webp', 'jpg'] as const;

export function wbPhotoCandidates(nm: string | number): string[] {
  const nmId = Number(nm);
  if (!nmId || Number.isNaN(nmId)) return [];

  const vol = Math.floor(nmId / 100000);
  const part = Math.floor(nmId / 1000);
  const urls: string[] = [];
  const seen = new Set<string>();

  for (const host of basketHosts(vol)) {
    for (const size of IMAGE_SIZES) {
      for (const ext of EXTENSIONS) {
        const url = `https://${host}/vol${vol}/part${part}/${nmId}/images/${size}/1.${ext}`;
        if (!seen.has(url)) {
          seen.add(url);
          urls.push(url);
        }
      }
    }
  }

  return urls;
}

export function wbPhotoUrl(nm: string | number): string | null {
  return wbPhotoCandidates(nm)[0] ?? null;
}

export function resolvePhotoUrl(photo: string | null | undefined, nm: string): string | null {
  if (photo) {
    const trimmed = photo.trim();
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
  }
  return wbPhotoUrl(nm);
}

export function allPhotoCandidates(photo: string | null | undefined, nm: string): string[] {
  const urls: string[] = [];
  const seen = new Set<string>();
  const add = (url: string | null) => {
    if (url && !seen.has(url)) {
      seen.add(url);
      urls.push(url);
    }
  };

  if (photo) {
    const trimmed = photo.trim();
    if (/^https?:\/\//i.test(trimmed)) add(trimmed);
  }

  for (const url of wbPhotoCandidates(nm)) add(url);
  return urls;
}
