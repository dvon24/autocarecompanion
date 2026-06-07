import { Icon } from '@/components/ui/Icon';

/**
 * 30x30 chat-type chip used by RecentChats rows. Photo + video share
 * the blue accent (both are vision flows); text uses the neutral chip.
 */
export function ChatTypeIcon({ type }: { type: 'text' | 'photo' | 'video' }) {
  if (type === 'video') {
    return (
      <span
        style={{
          width: 30,
          height: 30,
          borderRadius: 8,
          background: '#DBEAFE',
          color: '#1D4ED8',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon name="video" size={14} />
      </span>
    );
  }
  if (type === 'photo') {
    return (
      <span
        style={{
          width: 30,
          height: 30,
          borderRadius: 8,
          background: '#DBEAFE',
          color: '#1D4ED8',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon name="camera" size={14} />
      </span>
    );
  }
  return (
    <span
      style={{
        width: 30,
        height: 30,
        borderRadius: 8,
        background: '#F1F5F9',
        color: '#64748B',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <Icon name="chat" size={14} />
    </span>
  );
}
