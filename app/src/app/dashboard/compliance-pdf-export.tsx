'use client';

import { useState } from 'react';
import { useLocale } from '../locale-provider';

export function CompliancePdfExport({ plan }: { plan: string }) {
  const { locale } = useLocale();
  const [generating, setGenerating] = useState(false);

  const handleExport = async () => {
    if (plan === 'free') return;
    setGenerating(true);

    try {
      // Hämta data via befintlig CSV-endpoint (återanvänd logik)
      const res = await fetch('/api/export/compliance?limit=10000');
      if (!res.ok) throw new Error('Failed to fetch data');
      const csvText = await res.text();

      // Parsa CSV till rows
      const lines = csvText.split('\n').filter(l => l.trim());
      if (lines.length < 2) {
        alert(locale === 'sv' ? 'Ingen data att exportera' : 'No data to export');
        setGenerating(false);
        return;
      }

      // Dynamisk import (undvik att ladda 200kb+ i initial bundle)
      const { jsPDF } = await import('jspdf');
      const autoTable = (await import('jspdf-autotable')).default;

      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

      // Header
      doc.setFontSize(18);
      doc.setTextColor(15, 23, 42);
      doc.text('changebrief — Compliance Audit Report', 14, 18);

      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      const now = new Date();
      doc.text(
        `${locale === 'sv' ? 'Genererad' : 'Generated'}: ${now.toLocaleDateString(locale === 'sv' ? 'sv-SE' : 'en-US')} ${now.toLocaleTimeString(locale === 'sv' ? 'sv-SE' : 'en-US', { hour: '2-digit', minute: '2-digit' })}`,
        14, 24
      );

      // Parsa CSV data
      const dataRows = lines.slice(1).map(line => {
        // Enkel CSV-parsning som hanterar citattecken
        const row: string[] = [];
        let current = '';
        let inQuotes = false;
        for (const char of line) {
          if (char === '"') { inQuotes = !inQuotes; continue; }
          if (char === ',' && !inQuotes) { row.push(current.trim()); current = ''; continue; }
          current += char;
        }
        row.push(current.trim());
        return row;
      });

      // Välj kolumner för PDF (alla blir för brett)
      // timestamp, source, jurisdiction, compliance_action, importance, summary, reviewed_at
      const pdfHeaders = [
        locale === 'sv' ? 'Datum' : 'Date',
        locale === 'sv' ? 'Källa' : 'Source',
        locale === 'sv' ? 'Land' : 'Country',
        locale === 'sv' ? 'Åtgärd' : 'Action',
        locale === 'sv' ? 'Vikt' : 'Imp.',
        locale === 'sv' ? 'Sammanfattning' : 'Summary',
        locale === 'sv' ? 'Granskad' : 'Reviewed',
      ];

      const actionLabels: Record<string, string> = locale === 'sv'
        ? { action_required: 'Åtgärd krävs', review_recommended: 'Granska', info_only: 'Info' }
        : { action_required: 'Action required', review_recommended: 'Review', info_only: 'Info' };

      const pdfData = dataRows.map(row => {
        const date = row[0] ? new Date(row[0] + 'Z').toLocaleDateString(locale === 'sv' ? 'sv-SE' : 'en-US', { month: 'short', day: 'numeric' }) : '';
        return [
          date,
          row[2] || '', // source/name
          row[3] || '', // jurisdiction
          actionLabels[row[5]] || row[5] || '',
          row[6] || '', // importance
          (row[7] || '').substring(0, 80) + ((row[7] || '').length > 80 ? '...' : ''),
          row[9] ? new Date(row[9] + 'Z').toLocaleDateString(locale === 'sv' ? 'sv-SE' : 'en-US', { month: 'short', day: 'numeric' }) : '—',
        ];
      });

      // Sammanfattning
      const actionRequired = dataRows.filter(r => r[5] === 'action_required').length;
      const reviewRec = dataRows.filter(r => r[5] === 'review_recommended').length;
      const infoOnly = dataRows.filter(r => r[5] === 'info_only').length;
      const reviewed = dataRows.filter(r => r[9]).length;
      const unreviewed = dataRows.length - reviewed;

      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.text(
        `${locale === 'sv' ? 'Totalt' : 'Total'}: ${dataRows.length} | ` +
        `${locale === 'sv' ? 'Åtgärd krävs' : 'Action required'}: ${actionRequired} | ` +
        `${locale === 'sv' ? 'Granska' : 'Review'}: ${reviewRec} | ` +
        `Info: ${infoOnly} | ` +
        `${locale === 'sv' ? 'Ogranskade' : 'Unreviewed'}: ${unreviewed}`,
        14, 30
      );

      // Tabell
      autoTable(doc, {
        startY: 35,
        head: [pdfHeaders],
        body: pdfData,
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [30, 41, 59], textColor: [241, 245, 249], fontStyle: 'bold' },
        columnStyles: {
          0: { cellWidth: 22 },
          1: { cellWidth: 35 },
          2: { cellWidth: 15 },
          3: { cellWidth: 28 },
          4: { cellWidth: 12 },
          5: { cellWidth: 'auto' },
          6: { cellWidth: 22 },
        },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        didParseCell: (data: any) => {
          // Färgkoda action-kolumnen
          if (data.section === 'body' && data.column.index === 3) {
            const val = dataRows[data.row.index]?.[5];
            if (val === 'action_required') {
              data.cell.styles.textColor = [220, 38, 38];
              data.cell.styles.fontStyle = 'bold';
            } else if (val === 'review_recommended') {
              data.cell.styles.textColor = [217, 119, 6];
            }
          }
        },
      });

      // Footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(
          `changebrief.io — ${locale === 'sv' ? 'Sida' : 'Page'} ${i}/${pageCount}`,
          doc.internal.pageSize.getWidth() / 2, doc.internal.pageSize.getHeight() - 8,
          { align: 'center' }
        );
      }

      const date2 = new Date().toISOString().slice(0, 10);
      doc.save(`changebrief-compliance-audit-${date2}.pdf`);
    } catch (err) {
      console.error('PDF generation failed:', err);
      alert(locale === 'sv' ? 'Kunde inte generera PDF' : 'Failed to generate PDF');
    }

    setGenerating(false);
  };

  if (plan === 'free') {
    return (
      <a
        href="https://buy.polar.sh/polar_cl_JDnQNmWBFMsJp56ntC0GPsweHhIizDVhwWGIk4CAFVF"
        target="_blank"
        rel="noopener noreferrer"
        className="cursor-pointer rounded-lg bg-blue-50 border border-blue-100 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100 transition"
      >
        {locale === 'sv' ? 'Uppgradera för PDF' : 'Upgrade for PDF'}
      </a>
    );
  }

  return (
    <button
      onClick={handleExport}
      disabled={generating}
      className="cursor-pointer rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 transition disabled:opacity-50"
    >
      {generating ? (
        <span className="flex items-center gap-1.5">
          <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          {locale === 'sv' ? 'Genererar...' : 'Generating...'}
        </span>
      ) : (
        <span className="flex items-center gap-1.5">
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          PDF
        </span>
      )}
    </button>
  );
}
