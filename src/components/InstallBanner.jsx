// src/components/InstallBanner.jsx
// Install prompt banner, iOS instructions, offline queue badge, update banner

import { useState } from 'react';

const T = {
  orange: '#E8640A', ink: '#2D1B00', muted: '#8B6040',
  border: '#E8D5C0', white: '#FFFFFF', green: '#2A7A2A',
  ff: "'Palatino Linotype', Georgia, serif",
};

export function InstallBanner({ canInstall, onInstall, isInstalled }) {
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem('install-banner-dismissed') === 'true'
  );
  if (isInstalled || dismissed || !canInstall) return null;
  const dismiss = () => {
    localStorage.setItem('install-banner-dismissed', 'true');
    setDismissed(true);
  };
  return (
    <div style={{ position:'fixed', bottom:'80px', left:'16px', right:'16px', background:T.white, borderRadius:'16px', padding:'16px', boxShadow:'0 8px 32px rgba(45,27,0,0.18)', display:'flex', gap:'14px', alignItems:'center', zIndex:900, border:`1.5px solid ${T.border}` }}>
      <div style={{ fontSize:'36px', flexShrink:0 }}>🎨</div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontWeight:'700', color:T.ink, fontSize:'14px', fontFamily:T.ff }}>Add to Home Screen</div>
        <div style={{ color:T.muted, fontSize:'12px', marginTop:'3px', fontFamily:T.ff }}>Install for quick access — upload drawings straight from your camera roll</div>
      </div>
      <div style={{ display:'flex', gap:'8px', flexShrink:0 }}>
        <button onClick={dismiss} style={{ background:'none', border:'none', color:T.muted, cursor:'pointer', fontSize:'20px', padding:'4px' }}>✕</button>
        <button onClick={async () => { const accepted = await onInstall(); if (accepted) dismiss(); }}
          style={{ background:T.orange, color:'white', border:'none', borderRadius:'20px', padding:'9px 16px', fontWeight:'700', fontSize:'13px', cursor:'pointer', fontFamily:T.ff, whiteSpace:'nowrap' }}>
          Install
        </button>
      </div>
    </div>
  );
}

export function IOSInstallBanner() {
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem('ios-banner-dismissed') === 'true'
  );
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isStandalone = window.navigator.standalone;
  if (!isIOS || isStandalone || dismissed) return null;
  return (
    <div style={{ position:'fixed', bottom:'80px', left:'16px', right:'16px', background:T.white, borderRadius:'16px', padding:'18px', boxShadow:'0 8px 32px rgba(45,27,0,0.18)', zIndex:900, border:`1.5px solid ${T.border}` }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'14px' }}>
        <div style={{ display:'flex', gap:'10px', alignItems:'center' }}>
          <span style={{ fontSize:'28px' }}>🎨</span>
          <div>
            <div style={{ fontWeight:'700', color:T.ink, fontSize:'14px', fontFamily:T.ff }}>Install Forever Drawings</div>
            <div style={{ color:T.muted, fontSize:'12px', fontFamily:T.ff }}>Add to your iPhone home screen</div>
          </div>
        </div>
        <button onClick={() => { localStorage.setItem('ios-banner-dismissed','true'); setDismissed(true); }} style={{ background:'none', border:'none', color:T.muted, cursor:'pointer', fontSize:'20px' }}>✕</button>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
        {[
          { icon:'⬆️', text:'Tap the Share button at the bottom of Safari' },
          { icon:'➕', text:'Scroll down and tap "Add to Home Screen"' },
          { icon:'✓',  text:'Tap "Add" — the app icon appears on your home screen' },
        ].map((s,i) => (
          <div key={i} style={{ display:'flex', gap:'12px', alignItems:'center' }}>
            <div style={{ width:'28px', height:'28px', borderRadius:'50%', background:'#FFF5EE', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px', flexShrink:0 }}>{s.icon}</div>
            <span style={{ fontSize:'13px', color:T.ink, fontFamily:T.ff }}>{s.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function OfflineQueueBadge({ queueCount, isOnline }) {
  if (queueCount === 0) return null;
  return (
    <div style={{ position:'fixed', bottom:'20px', left:'50%', transform:'translateX(-50%)', background:isOnline?T.green:'#B45309', color:'white', borderRadius:'20px', padding:'10px 20px', fontFamily:T.ff, fontSize:'13px', fontWeight:'700', boxShadow:'0 4px 16px rgba(0,0,0,0.2)', zIndex:800, display:'flex', gap:'8px', alignItems:'center' }}>
      <span>{isOnline ? '☁️' : '📵'}</span>
      {isOnline
        ? `Syncing ${queueCount} queued upload${queueCount !== 1 ? 's' : ''}…`
        : `${queueCount} upload${queueCount !== 1 ? 's' : ''} queued — will sync when online`
      }
    </div>
  );
}

export function UpdateBanner({ onUpdate }) {
  return (
    <div style={{ position:'fixed', top:0, left:0, right:0, background:T.ink, color:'white', padding:'12px 20px', display:'flex', justifyContent:'space-between', alignItems:'center', zIndex:1000, fontFamily:T.ff }}>
      <span style={{ fontSize:'13px' }}>✨ A new version is available</span>
      <button onClick={onUpdate} style={{ background:T.orange, color:'white', border:'none', borderRadius:'20px', padding:'7px 16px', fontSize:'13px', fontWeight:'700', cursor:'pointer', fontFamily:T.ff }}>Update Now</button>
    </div>
  );
}
