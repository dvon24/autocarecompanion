import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Au7o - AI-Powered Automotive Repair Guides';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#0f172a',
          backgroundImage: 'linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)',
          padding: '60px 80px',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Decorative circles */}
        <div
          style={{
            position: 'absolute',
            top: -100,
            right: -100,
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'rgba(59, 130, 246, 0.1)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -80,
            left: -80,
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'rgba(139, 92, 246, 0.1)',
          }}
        />

        {/* Logo */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 700,
            color: 'white',
            marginBottom: 20,
          }}
        >
          Au7o
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 36,
            color: '#94a3b8',
            marginBottom: 60,
          }}
        >
          AI-Powered Automotive Repair Guides
        </div>

        {/* Features */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 24,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div
              style={{
                width: 16,
                height: 16,
                borderRadius: '50%',
                background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
              }}
            />
            <span style={{ fontSize: 24, color: '#cbd5e1' }}>
              Step-by-step guides for your exact vehicle
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div
              style={{
                width: 16,
                height: 16,
                borderRadius: '50%',
                background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
              }}
            />
            <span style={{ fontSize: 24, color: '#cbd5e1' }}>
              AI symptom diagnosis chat
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div
              style={{
                width: 16,
                height: 16,
                borderRadius: '50%',
                background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
              }}
            />
            <span style={{ fontSize: 24, color: '#cbd5e1' }}>
              Works offline - no internet required
            </span>
          </div>
        </div>

        {/* URL at bottom */}
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            left: 80,
            fontSize: 20,
            color: '#64748b',
          }}
        >
          au7o.io
        </div>

        {/* Car icon placeholder */}
        <div
          style={{
            position: 'absolute',
            right: 100,
            bottom: 150,
            fontSize: 120,
            opacity: 0.3,
          }}
        >
          🚗
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
