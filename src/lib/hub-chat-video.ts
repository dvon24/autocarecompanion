type VideoVehicle = {
  year?: number;
  make?: string;
  model?: string;
  trim?: string;
  engine?: string;
  transmission?: string;
};

export const VIDEO_MARK_OPEN = '[[VIDEO:';

export function buildYouTubeSearchMarkdown(topic: string, vehicle: VideoVehicle): string {
  const cleanTopic = String(topic || '')
    .replace(/[\[\](){}<>]/g, ' ')
    .replace(/https?:\/\/\S+/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 180);
  if (!cleanTopic) return '';
  const identity = [vehicle.year, vehicle.make, vehicle.model, vehicle.trim, vehicle.engine, vehicle.transmission]
    .map((value) => String(value || '').trim())
    .filter(Boolean)
    .join(' ');
  const query = `${identity} ${cleanTopic} how to`.replace(/\s+/g, ' ').trim();
  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
  return `[Watch vehicle-specific how-to videos on YouTube](${url})`;
}

export function partialGroundingMarkerHold(text: string, openers: string[]): number {
  let held = 0;
  for (const opener of openers) {
    const max = Math.min(text.length, opener.length - 1);
    for (let length = max; length > held; length -= 1) {
      if (opener.startsWith(text.slice(text.length - length))) {
        held = length;
        break;
      }
    }
  }
  return held;
}
