'use client';

import { useMemo } from 'react';
import { useLocale } from '../../locale-provider';

interface ReportPreviewProps {
  sections: Record<string, boolean>;
  frequency: string;
  email: string;
}

// Mock-data som representerar en typisk veckorapport
const MOCK_CHANGES = [
  { name: 'Finansinspektionen — Regelverk', importance: 8, summary: 'Uppdaterade kapitaltäckningsregler för kreditinstitut (FFFS 2025:12)' },
  { name: 'Transportstyrelsen — Föreskrifter', importance: 6, summary: 'Ny version av järnvägssäkerhetsföreskrifter publicerad' },
  { name: 'Riksbanken — Penningpolitik', importance: 4, summary: 'Mindre justeringar i ordlista och navigering' },
];

const MOCK_COMPLIANCE = [
  { name: 'Finansinspektionen', action: 'action_required', jurisdiction: 'SE' },
  { name: 'EBA — Guidelines', action: 'review_recommended', jurisdiction: 'EU' },
];

export function ReportPreview({ sections, frequency, email }: ReportPreviewProps) {
  const { t, locale } = useLocale();
  const sv = locale === 'sv';

  const dateStr = useMemo(() => {
    return new Date().toLocaleDateString(sv ? 'sv-SE' : 'en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, [sv]);

  const subjectLine = sv
    ? `Din veckorapport: ${MOCK_CHANGES.length} ändringar upptäckta`
    : `Your weekly digest: ${MOCK_CHANGES.length} changes detected`;

  if (frequency === 'off') {
    return (
      <div className="lg:sticky lg:top-24">
        <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--app-text-secondary)' }}>
          {t('reports.preview.title')}
        </h3>
        <div
          className="rounded-xl p-8 text-center"
          style={{
            background: 'var(--app-bg-card)',
            border: '1px solid var(--app-border)',
          }}
        >
          <p className="text-sm" style={{ color: 'var(--app-text-muted)' }}>
            {sv ? 'Aktivera rapporter för att se förhandsvisning' : 'Enable reports to see preview'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="lg:sticky lg:top-24">
      <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--app-text-secondary)' }}>
        {t('reports.preview.title')}
      </h3>
      <div
        className="rounded-xl overflow-hidden"
        style={{
          border: '1px solid var(--app-border)',
          boxShadow: 'var(--app-shadow)',
        }}
      >
        {/* Mock email header */}
        <div
          className="px-4 py-3 text-xs space-y-1"
          style={{
            background: 'var(--app-bg-secondary)',
            borderBottom: '1px solid var(--app-border)',
            color: 'var(--app-text-muted)',
          }}
        >
          <p><span className="font-medium">{sv ? 'Från' : 'From'}:</span> changebrief &lt;digest@changebrief.io&gt;</p>
          <p><span className="font-medium">{sv ? 'Till' : 'To'}:</span> {email}</p>
          <p><span className="font-medium">{sv ? 'Ämne' : 'Subject'}:</span> <span style={{ color: 'var(--app-text)' }}>{subjectLine}</span></p>
          <p><span className="font-medium">{sv ? 'Datum' : 'Date'}:</span> {dateStr}</p>
        </div>

        {/* Mock email body — dark theme like the real weekly-digest */}
        <div style={{ background: '#06080f', padding: '24px 16px', fontSize: '13px', lineHeight: '1.5' }}>
          {/* Brand header */}
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <p style={{ color: '#f1f5f9', fontSize: '18px', fontWeight: 700, margin: 0 }}>
              change<span style={{ color: '#60a5fa' }}>brief</span>
            </p>
            <p style={{ color: '#64748b', fontSize: '12px', margin: '4px 0 0' }}>
              {sv ? 'Veckorapport' : 'Weekly Digest'}
            </p>
          </div>

          {/* Summary card */}
          {sections.changeSummary && (
            <div style={{
              background: '#0f172a',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '16px',
            }}>
              <p style={{ color: '#f1f5f9', fontSize: '14px', fontWeight: 600, margin: '0 0 12px' }}>
                {sv ? 'Veckans sammanfattning' : 'This week at a glance'}
              </p>
              <div style={{ display: 'flex', gap: '20px' }}>
                <div>
                  <div style={{ color: '#60a5fa', fontSize: '22px', fontWeight: 700 }}>3</div>
                  <div style={{ color: '#64748b', fontSize: '11px' }}>{sv ? 'ändringar' : 'changes'}</div>
                </div>
                <div>
                  <div style={{ color: '#60a5fa', fontSize: '22px', fontWeight: 700 }}>2</div>
                  <div style={{ color: '#64748b', fontSize: '11px' }}>{sv ? 'sidor' : 'pages'}</div>
                </div>
                <div>
                  <div style={{ color: '#60a5fa', fontSize: '22px', fontWeight: 700 }}>5</div>
                  <div style={{ color: '#64748b', fontSize: '11px' }}>{sv ? 'bevakade' : 'monitored'}</div>
                </div>
              </div>
            </div>
          )}

          {/* Compliance section */}
          {sections.compliance && (
            <div style={{
              background: '#0f172a',
              border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: '12px',
              overflow: 'hidden',
              marginBottom: '16px',
            }}>
              <div style={{
                padding: '10px 16px',
                borderBottom: '1px solid #1e293b',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <span style={{ color: '#f1f5f9', fontSize: '12px', fontWeight: 600 }}>
                  ⚖️ {sv ? 'Regulatoriska ändringar' : 'Regulatory Changes'}
                </span>
                <span style={{
                  background: 'rgba(239,68,68,0.15)',
                  color: '#ef4444',
                  padding: '1px 6px',
                  borderRadius: '12px',
                  fontSize: '10px',
                  fontWeight: 600,
                }}>
                  1 {sv ? 'kräver åtgärd' : 'action required'}
                </span>
              </div>
              {MOCK_COMPLIANCE.map((c, i) => (
                <div key={i} style={{ padding: '8px 16px', borderBottom: i < MOCK_COMPLIANCE.length - 1 ? '1px solid #1e293b' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                    <span style={{
                      color: c.action === 'action_required' ? '#ef4444' : '#f59e0b',
                      fontSize: '10px',
                      fontWeight: 600,
                    }}>
                      {c.action === 'action_required' ? (sv ? '🔴 Åtgärd' : '🔴 Action') : (sv ? '🟡 Granska' : '🟡 Review')}
                    </span>
                    <span style={{ color: '#475569', fontSize: '10px' }}>[{c.jurisdiction}]</span>
                  </div>
                  <p style={{ color: '#f1f5f9', fontSize: '12px', margin: 0, fontWeight: 500 }}>{c.name}</p>
                </div>
              ))}
            </div>
          )}

          {/* Change log */}
          {sections.changeLog && (
            <div style={{
              background: '#0f172a',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '12px',
              overflow: 'hidden',
              marginBottom: '16px',
            }}>
              <div style={{ padding: '10px 16px', borderBottom: '1px solid #1e293b' }}>
                <span style={{ color: '#f1f5f9', fontSize: '12px', fontWeight: 600 }}>
                  {sv ? 'Alla ändringar (rankade)' : 'All changes (ranked)'}
                </span>
              </div>
              {MOCK_CHANGES.map((c, i) => {
                const color = c.importance >= 7 ? '#ef4444' : c.importance >= 4 ? '#f97316' : '#22c55e';
                return (
                  <div key={i} style={{ padding: '8px 16px', borderBottom: i < MOCK_CHANGES.length - 1 ? '1px solid #1e293b' : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                      <span style={{
                        background: `${color}20`,
                        color,
                        padding: '1px 6px',
                        borderRadius: '12px',
                        fontSize: '10px',
                        fontWeight: 600,
                      }}>
                        {c.importance}/10
                      </span>
                      <span style={{ color: '#f1f5f9', fontSize: '12px', fontWeight: 500 }}>{c.name}</span>
                    </div>
                    <p style={{ margin: '2px 0 0', color: '#94a3b8', fontSize: '11px' }}>{c.summary}</p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Monitor status (placeholder) */}
          {sections.monitorStatus && (
            <div style={{
              background: '#0f172a',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '12px',
              padding: '12px 16px',
              marginBottom: '16px',
            }}>
              <span style={{ color: '#f1f5f9', fontSize: '12px', fontWeight: 600 }}>
                {sv ? 'Övervakningsstatus' : 'Monitor Status'}
              </span>
              <p style={{ color: '#64748b', fontSize: '11px', margin: '4px 0 0' }}>
                ● 5 {sv ? 'aktiva' : 'active'} · 0 {sv ? 'fel' : 'errors'}
              </p>
            </div>
          )}

          {/* Recommendations (placeholder) */}
          {sections.recommendations && (
            <div style={{
              background: '#0f172a',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '12px',
              padding: '12px 16px',
              marginBottom: '16px',
            }}>
              <span style={{ color: '#f1f5f9', fontSize: '12px', fontWeight: 600 }}>
                {sv ? 'Rekommendationer' : 'Recommendations'}
              </span>
              <p style={{ color: '#64748b', fontSize: '11px', margin: '4px 0 0' }}>
                {sv ? '2 nya sidor att bevaka' : '2 new pages to monitor'}
              </p>
            </div>
          )}

          {/* CTA */}
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <span style={{
              display: 'inline-block',
              background: 'linear-gradient(135deg, #2563eb, #4f46e5)',
              color: 'white',
              padding: '8px 24px',
              borderRadius: '10px',
              fontSize: '12px',
              fontWeight: 600,
            }}>
              {sv ? 'Öppna Dashboard' : 'Open Dashboard'}
            </span>
          </div>

          {/* Footer */}
          <div style={{ textAlign: 'center', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #1e293b' }}>
            <p style={{ color: '#475569', fontSize: '10px', margin: 0 }}>
              {sv ? 'Du får detta mejl för att du har veckorapport aktiverad.' : "You're receiving this because you have weekly digest enabled."}
            </p>
            <p style={{ color: '#334155', fontSize: '9px', margin: '4px 0 0' }}>© 2026 changebrief</p>
          </div>
        </div>
      </div>
    </div>
  );
}
