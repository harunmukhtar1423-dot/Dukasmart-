import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Sale, Store, Customer } from '../types';
import { format } from 'date-fns';

export const generateReceiptHTML = (
  sale: Sale,
  store: Store,
  customer?: Customer
): string => {
  const itemsHTML = sale.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.productName}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">$${item.unitPrice.toFixed(2)}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">$${item.total.toFixed(2)}</td>
    </tr>
  `
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 20px;
          max-width: 800px;
          margin: 0 auto;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #6200ee;
          padding-bottom: 20px;
        }
        .header h1 {
          color: #6200ee;
          margin: 0 0 10px 0;
        }
        .info-section {
          margin-bottom: 20px;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        th {
          background-color: #6200ee;
          color: white;
          padding: 12px 8px;
          text-align: left;
        }
        .totals {
          margin-top: 20px;
          border-top: 2px solid #333;
          padding-top: 10px;
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 16px;
        }
        .grand-total {
          font-size: 20px;
          font-weight: bold;
          color: #6200ee;
          margin-top: 10px;
          padding-top: 10px;
          border-top: 2px solid #6200ee;
        }
        .footer {
          text-align: center;
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #eee;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${store.name}</h1>
        <p>${store.address || ''}</p>
        <p>${store.phone || ''}</p>
        ${store.email ? `<p>${store.email}</p>` : ''}
      </div>

      <div class="info-section">
        <div class="info-row">
          <strong>Receipt #:</strong>
          <span>${sale.id.substring(0, 8).toUpperCase()}</span>
        </div>
        <div class="info-row">
          <strong>Date:</strong>
          <span>${format(new Date(sale.createdAt), 'MMM dd, yyyy hh:mm a')}</span>
        </div>
        ${customer ? `
        <div class="info-row">
          <strong>Customer:</strong>
          <span>${customer.name}</span>
        </div>
        ` : ''}
        <div class="info-row">
          <strong>Payment Method:</strong>
          <span>${sale.paymentMethod.toUpperCase()}</span>
        </div>
        <div class="info-row">
          <strong>Status:</strong>
          <span>${sale.paymentStatus.toUpperCase()}</span>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th style="text-align: center;">Qty</th>
            <th style="text-align: right;">Price</th>
            <th style="text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHTML}
        </tbody>
      </table>

      <div class="totals">
        <div class="total-row">
          <span>Subtotal:</span>
          <span>$${sale.subtotal.toFixed(2)}</span>
        </div>
        ${sale.discount > 0 ? `
        <div class="total-row">
          <span>Discount:</span>
          <span>-$${sale.discount.toFixed(2)}</span>
        </div>
        ` : ''}
        ${sale.tax > 0 ? `
        <div class="total-row">
          <span>Tax:</span>
          <span>$${sale.tax.toFixed(2)}</span>
        </div>
        ` : ''}
        <div class="total-row grand-total">
          <span>TOTAL:</span>
          <span>$${sale.total.toFixed(2)}</span>
        </div>
        ${sale.amountPaid > 0 ? `
        <div class="total-row">
          <span>Amount Paid:</span>
          <span>$${sale.amountPaid.toFixed(2)}</span>
        </div>
        ` : ''}
        ${sale.amountDue > 0 ? `
        <div class="total-row" style="color: #F44336;">
          <span>Amount Due:</span>
          <span>$${sale.amountDue.toFixed(2)}</span>
        </div>
        ` : ''}
        ${sale.amountPaid > sale.total ? `
        <div class="total-row" style="color: #4CAF50;">
          <span>Change:</span>
          <span>$${(sale.amountPaid - sale.total).toFixed(2)}</span>
        </div>
        ` : ''}
      </div>

      ${sale.notes ? `
      <div style="margin-top: 20px; padding: 10px; background-color: #f5f5f5; border-radius: 5px;">
        <strong>Notes:</strong> ${sale.notes}
      </div>
      ` : ''}

      <div class="footer">
        <p>Thank you for your business!</p>
        <p style="font-size: 12px;">Powered by Dukasmart</p>
      </div>
    </body>
    </html>
  `;
};

export const printReceipt = async (
  sale: Sale,
  store: Store,
  customer?: Customer
): Promise<void> => {
  try {
    const html = generateReceiptHTML(sale, store, customer);
    await Print.printAsync({
      html,
    });
  } catch (error) {
    console.error('Error printing receipt:', error);
    throw error;
  }
};

export const shareReceipt = async (
  sale: Sale,
  store: Store,
  customer?: Customer
): Promise<void> => {
  try {
    const html = generateReceiptHTML(sale, store, customer);
    const { uri } = await Print.printToFileAsync({ html });

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Share Receipt',
        UTI: 'com.adobe.pdf',
      });
    } else {
      throw new Error('Sharing is not available on this device');
    }
  } catch (error) {
    console.error('Error sharing receipt:', error);
    throw error;
  }
};
