import React from "react";

const partners = [
  { name: "PIX BCB",    logo: "pix-logo",     type: "inline-svg"  },
  { name: "Supabase",   logo: "https://cdn.simpleicons.org/supabase/3ECF8E",    type: "img" },
  { name: "Vercel",     logo: "https://cdn.simpleicons.org/vercel/ffffff",      type: "img" },
  { name: "Next.js",    logo: "https://cdn.simpleicons.org/nextdotjs/ffffff",   type: "img" },
  { name: "Prisma",     logo: "https://cdn.simpleicons.org/prisma/ffffff",      type: "img" },
  { name: "TypeScript", logo: "https://cdn.simpleicons.org/typescript/3178C6", type: "img" },
  { name: "Tailwind",   logo: "https://cdn.simpleicons.org/tailwindcss/06B6D4",type: "img" },
  { name: "React",      logo: "https://cdn.simpleicons.org/react/61DAFB",      type: "img" },
  { name: "Resend",     logo: "https://cdn.simpleicons.org/resend/ffffff",      type: "img" },
];

export function PartnerTicker() {
  const PixLogo = () => (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="8" fill="#32BCAD" fillOpacity="0.15"/>
      {/* 4 triângulos do PIX em miniatura */}
      <g transform="translate(16,16)">
        <polygon points="0,-7 5,0 0,-3"  fill="#32BCAD" opacity="0.9"/>
        <polygon points="0,7 -5,0 0,3"   fill="#32BCAD" opacity="0.9"/>
        <polygon points="-7,0 0,-5 -3,0" fill="#32BCAD" opacity="0.7"/>
        <polygon points="7,0 0,5 3,0"    fill="#32BCAD" opacity="0.7"/>
      </g>
    </svg>
  );

  return (
    <section className="bg-bg-void overflow-hidden" style={{ padding: '60px 0', borderTop: '1px solid rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes ticker {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .ticker-wrapper {
          overflow: hidden;
          width: 100%;
          mask-image: linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%);
          -webkit-mask-image: linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%);
        }
        .ticker-track {
          display: flex;
          width: max-content;
          animation: ticker 25s linear infinite;
        }
        .ticker-track:hover {
          animation-play-state: paused;
        }
        .ticker-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 0 40px;
          flex-shrink: 0;
          cursor: default;
        }
        .ticker-item .logo-container {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0.6;
          filter: grayscale(0.2);
          transition: opacity 0.2s, filter 0.2s;
        }
        .ticker-item:hover .logo-container {
          opacity: 0.9;
          filter: grayscale(0);
        }
        .ticker-item img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
        .ticker-item .partner-name {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.35);
          transition: color 0.2s;
        }
        .ticker-item:hover .partner-name {
          color: rgba(255,255,255,0.7);
        }
      `}} />

      <div 
        style={{ 
          fontSize: '11px', 
          fontWeight: 500, 
          letterSpacing: '0.12em', 
          color: 'rgba(255,255,255,0.25)', 
          textAlign: 'center',
          marginBottom: '32px' 
        }}
      >
        INTEGRADO COM OS MELHORES PARCEIROS
      </div>
      
      <div className="ticker-wrapper">
        <div className="ticker-track">
          {[...partners, ...partners].map((partner, index) => (
            <div key={`${partner.name}-${index}`} className="ticker-item">
              <div className="logo-container">
                {partner.type === 'inline-svg' && partner.logo === 'pix-logo' && <PixLogo />}
                {partner.type === 'img' && <img src={partner.logo} alt={partner.name} />}
              </div>
              <span className="partner-name">{partner.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
