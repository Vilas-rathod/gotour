import { useCallback, useState } from 'react';
import { request } from '@/lib/http';
import { useToast } from '@/hooks/useToast';
import { formatCurrency, formatDate } from '@/lib/format';
import type { Invoice } from '@/types/api';

/**
 * Fetches the invoice payload and renders it to a printable document in a new
 * window. Generating it client-side keeps the backend free of a PDF dependency;
 * the browser's own "Save as PDF" produces the file.
 */
export function useInvoiceDownload() {
  const toast = useToast();
  const [isDownloading, setIsDownloading] = useState(false);

  const download = useCallback(
    async (bookingReference: string) => {
      setIsDownloading(true);
      try {
        const invoice = await request<Invoice>({
          url: `/v1/bookings/${bookingReference}/invoice`,
        });

        const printWindow = window.open('', '_blank', 'width=860,height=1000');
        if (!printWindow) {
          toast.error('Allow pop-ups to download your invoice');
          return;
        }

        printWindow.document.write(buildInvoiceHtml(invoice));
        printWindow.document.close();
        printWindow.focus();
      } catch (error) {
        toast.apiError(error, 'Could not load the invoice');
      } finally {
        setIsDownloading(false);
      }
    },
    [toast],
  );

  return { download, isDownloading };
}

/** Escapes user-supplied strings before they enter the invoice markup. */
function escapeHtml(value: string | null | undefined): string {
  if (!value) return '';
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildInvoiceHtml(invoice: Invoice): string {
  const rows = invoice.lineItems
    .map(
      (item) => `
        <tr>
          <td>${escapeHtml(item.label)}</td>
          <td class="num">${formatCurrency(item.unitPrice, invoice.currency)}</td>
          <td class="num">${item.quantity}</td>
          <td class="num">${formatCurrency(item.amount, invoice.currency)}</td>
        </tr>`,
    )
    .join('');

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Invoice ${escapeHtml(invoice.invoiceNumber)} — GoTour</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: system-ui, -apple-system, "Segoe UI", sans-serif; color: #1a2b2e; margin: 0; padding: 40px; }
  .head { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0b7b6b; padding-bottom: 20px; }
  .brand { font-size: 26px; font-weight: 700; color: #0b7b6b; letter-spacing: -0.5px; }
  .muted { color: #667; font-size: 12px; }
  h1 { font-size: 20px; margin: 0 0 4px; }
  .grid { display: flex; gap: 48px; margin: 28px 0; }
  table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px; }
  th { text-align: left; background: #f4f7f7; padding: 10px; font-size: 11px; text-transform: uppercase; letter-spacing: .06em; }
  td { padding: 10px; border-bottom: 1px solid #e6ecec; }
  .num { text-align: right; }
  .totals { margin-left: auto; width: 300px; margin-top: 18px; }
  .totals div { display: flex; justify-content: space-between; padding: 7px 10px; font-size: 14px; }
  .totals .grand { border-top: 2px solid #0b7b6b; font-weight: 700; font-size: 16px; color: #0b7b6b; }
  .paid { display: inline-block; padding: 4px 12px; border-radius: 999px; font-size: 11px; font-weight: 700;
          background: ${invoice.paymentStatus === 'PAID' ? '#dcfce7' : '#fef3c7'};
          color: ${invoice.paymentStatus === 'PAID' ? '#166534' : '#92400e'}; }
  footer { margin-top: 44px; border-top: 1px solid #e6ecec; padding-top: 16px; font-size: 11px; color: #778; }
  @media print { body { padding: 20px; } .no-print { display: none; } }
</style>
</head>
<body>
  <div class="head">
    <div>
      <div class="brand">GoTour</div>
      <div class="muted">GoTour Travel Technologies<br />Pune, Maharashtra, India<br />hello@gotour.example.com</div>
    </div>
    <div style="text-align:right">
      <h1>Invoice</h1>
      <div class="muted">
        ${escapeHtml(invoice.invoiceNumber)}<br />
        Issued ${formatDate(invoice.issuedAt)}
      </div>
      <div style="margin-top:8px"><span class="paid">${escapeHtml(invoice.paymentStatus)}</span></div>
    </div>
  </div>

  <div class="grid">
    <div>
      <div class="muted"><strong>BILLED TO</strong></div>
      <div>${escapeHtml(invoice.customerName)}<br />${escapeHtml(invoice.customerEmail)}</div>
    </div>
    <div>
      <div class="muted"><strong>BOOKING</strong></div>
      <div>${escapeHtml(invoice.bookingReference)}<br />${escapeHtml(invoice.itemTitle)}</div>
    </div>
    <div>
      <div class="muted"><strong>TRAVEL DATES</strong></div>
      <div>${formatDate(invoice.startDate)} — ${formatDate(invoice.endDate)}<br />${invoice.travellerCount} traveller(s)</div>
    </div>
  </div>

  <table>
    <thead>
      <tr><th>Description</th><th class="num">Unit price</th><th class="num">Qty</th><th class="num">Amount</th></tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>

  <div class="totals">
    <div><span>Subtotal</span><span>${formatCurrency(invoice.subtotal, invoice.currency)}</span></div>
    <div><span>Taxes &amp; fees</span><span>${formatCurrency(invoice.taxes, invoice.currency)}</span></div>
    <div class="grand"><span>Total</span><span>${formatCurrency(invoice.total, invoice.currency)}</span></div>
  </div>

  <footer>
    This is a computer-generated invoice and does not require a signature.
    For questions about this booking, contact hello@gotour.example.com quoting ${escapeHtml(invoice.bookingReference)}.
  </footer>

  <script>window.addEventListener('load', () => window.print());</script>
</body>
</html>`;
}
