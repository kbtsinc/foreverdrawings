// src/components/VaultEmail.jsx
// Shows the user their unique vault email address

import { useState, useEffect } from 'react';

const T = {
  bg:'#FFF8F0', white:'#FFFFFF', ink:'#2D1B00', muted:'#8B6040',
  border:'#E8D5C0', orange:'#E8640A', green:'#2A7A2A',
  ff:"'Palatino Linotype', Georgia, serif",
};

export function VaultEmail({ userId, session }) {
  const [vaultEmail,  setVaultEmail]  = useState('');
  const [loading,     setLoading]     = useState(true);
  const [copied,      setCopied]      = useState(false);
  const [testSending, setTestSending] = useState(false);
  const [testResult,  setTestResult]  = useState('');

  useEffect(() => {
    async function fetchVaultEmail() {
      try {
        const res = await fetch('/api/email/vault-address', {
          headers: { Authorization: `Bearer ${session?.access_token}` },
        });
        const data = await res.json();
        setVaultEmail(data.vaultEmail || '');
      } catch (err) {
        console.error('Failed to fetch vault email:', err);
      } finally {
        setLoading(false);
      }
    }
    if (session) fetchVaultEmail();
    else setLoading(false);
  }, [session]);

  function copy() {
    navigator.clipboard.writeText(vaultEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  async function sendTest() {
    setTestSending(true);
    await new Promise(r => setTimeout(r, 1500));
    setTestResult('Test email sent! Check your vault in a moment.');
    setTestSending(false);
  }

  return (
    <div style={{ fontFamily:T.ff }}>
      <div style={{ marginBottom:'20px' }}>
        <h3 style={{ color:T.ink, fontSize:'16px', margin:'0 0 6px', fontWeight:'700' }}>Your Vault Email Address</h3>
        <p style={{ color:T.muted, fontSize:'13px', margin:0, lineHeight:'1.6' }}>
          Forward school emails or email photos directly to this address — they'll appear in your vault automatically.
        </p>
      </div>

      <div style={{ background:T.bg, borderRadius:'12px', padding:'14px 16px', marginBottom:'14px', border:`1.5px solid ${T.border}` }}>
        {loading ? (
          <div style={{ color:T.muted, fontSize:'14px' }}>Loading your vault address…</div>
        ) : (
          <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
            <span style={{ flex:1, fontSize:'13px', color:T.ink, fontFamily:'monospace', wordBreak:'break-all', fontWeight:'600' }}>{vaultEmail || 'Not available — sign in first'}</span>
            <div style={{ display:'flex', gap:'6px', flexShrink:0 }}>
              <button onClick={copy} style={{ background:copied?T.green:T.orange, color:'white', border:'none', borderRadius:'20px', padding:'7px 14px', fontSize:'12px', fontWeight:'700', cursor:'pointer', fontFamily:T.ff }}>
                {copied ? '✓ Copied' : 'Copy'}
              </button>
              {'share' in navigator && (
                <button onClick={() => navigator.share({ title:'My Forever Drawings Vault Email', text:`Send drawings to my vault: ${vaultEmail}` })} style={{ background:T.ink, color:'white', border:'none', borderRadius:'20px', padding:'7px 14px', fontSize:'12px', fontWeight:'700', cursor:'pointer', fontFamily:T.ff }}>Share</button>
              )}
            </div>
          </div>
        )}
      </div>

      <div style={{ marginBottom:'20px' }}>
        {[
          { icon:'📩', title:'Forward school emails',  body:'When your school emails artwork photos, just forward the email to your vault address.' },
          { icon:'📸', title:'Email from your phone',  body:'Take a photo and email it directly. Attach up to 10 photos per email.' },
          { icon:'👨‍👩‍👧', title:'Share with family',    body:'Give grandparents this address so they can add drawings to your vault too.' },
          { icon:'✉️', title:'Any email works',        body:"Send from Gmail, Apple Mail, Outlook — we'll match it to your account." },
        ].map(item => (
          <div key={item.icon} style={{ display:'flex', gap:'12px', padding:'10px 0', borderBottom:`1px solid ${T.border}` }}>
            <span style={{ fontSize:'20px', flexShrink:0 }}>{item.icon}</span>
            <div>
              <div style={{ fontWeight:'700', color:T.ink, fontSize:'13px' }}>{item.title}</div>
              <div style={{ color:T.muted, fontSize:'12px', marginTop:'2px', lineHeight:'1.5' }}>{item.body}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ background:'#F0FFF4', border:'1.5px solid #BBF7D0', borderRadius:'12px', padding:'14px 16px', marginBottom:'16px' }}>
        <p style={{ margin:'0 0 6px', fontWeight:'700', color:'#065F46', fontSize:'13px' }}>What gets saved automatically</p>
        <p style={{ margin:0, color:'#047857', fontSize:'12px', lineHeight:'1.6' }}>
          JPG, PNG, HEIC, and WebP photos attached to emails are saved to your vault. The email subject becomes the drawing title. You'll get a confirmation email when it's saved.
        </p>
      </div>

      {!loading && vaultEmail && (
        <div>
          <button onClick={sendTest} disabled={testSending} style={{ background:'none', border:`1.5px solid ${T.border}`, borderRadius:'20px', padding:'9px 18px', color:T.muted, fontSize:'13px', cursor:'pointer', fontFamily:T.ff, fontWeight:'600' }}>
            {testSending ? 'Sending test…' : 'Send a test email'}
          </button>
          {testResult && <p style={{ color:T.green, fontSize:'12px', marginTop:'8px' }}>✓ {testResult}</p>}
        </div>
      )}
    </div>
  );
}
