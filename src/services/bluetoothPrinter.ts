import type { Sale, CompanySettings } from '../types';
import { formatCFA, formatDateTimeFr } from '../utils/formatters';

export class BluetoothThermalPrinter {
  private device: any = null;
  private characteristic: any = null;

  async requestDevice(): Promise<boolean> {
    if (!('bluetooth' in navigator)) {
      alert('Web Bluetooth n\'est pas supporté par ce navigateur. Utilisez Chrome ou Edge.');
      return false;
    }

    try {
      // @ts-ignore
      this.device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [
          '000018f0-0000-1000-8000-00805f9b34fb', // Standard POS Printer Service
          'e7810a71-73ae-499d-8c15-faa9aef0c3f2',
          '49535343-fe7d-4ae5-8fa9-9fafd205e455'
        ]
      });

      const server = await this.device.gatt.connect();
      const services = await server.getPrimaryServices();

      for (const service of services) {
        const characteristics = await service.getCharacteristics();
        for (const char of characteristics) {
          if (char.properties.write || char.properties.writeWithoutResponse) {
            this.characteristic = char;
            break;
          }
        }
        if (this.characteristic) break;
      }

      return !!this.characteristic;
    } catch (err) {
      console.error('Bluetooth connection failed:', err);
      return false;
    }
  }

  async printSaleReceipt(sale: Sale, company: CompanySettings): Promise<void> {
    // If Web Bluetooth is connected, generate 384px raster canvas and send chunks
    if (this.characteristic) {
      try {
        const bytes = await this.renderReceiptToEscPosBytes(sale, company);
        await this.sendBytesInChunks(bytes);
        return;
      } catch (e) {
        console.warn('Bluetooth print failed, falling back to window print:', e);
      }
    }

    // Fallback: Isolated Pop-up Thermal Receipt Window (58mm width)
    this.printViaBrowserPopup(sale, company);
  }

  private printViaBrowserPopup(sale: Sale, company: CompanySettings): void {
    const printWin = window.open('', '_blank', 'width=380,height=600');
    if (!printWin) {
      window.print();
      return;
    }

    const itemsHtml = sale.items.map(item => `
      <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 3px;">
        <div style="flex: 1; padding-right: 4px;">
          <div>${item.name}</div>
          <div style="color: #666; font-size: 10px;">${item.qty} x ${Math.round(item.priceUnit).toLocaleString('fr-FR')} F</div>
        </div>
        <div style="font-weight: bold; font-family: monospace;">${Math.round(item.total).toLocaleString('fr-FR')} F</div>
      </div>
    `).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Ticket ${sale.invoiceNumber}</title>
        <style>
          @page { size: 58mm auto; margin: 0; }
          body {
            font-family: monospace, system-ui, sans-serif;
            width: 58mm;
            max-width: 58mm;
            margin: 0 auto;
            padding: 8px 4px;
            color: #000;
            background: #fff;
            box-sizing: border-box;
          }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .divider { border-top: 1px dashed #000; margin: 6px 0; }
          .row { display: flex; justify-content: space-between; font-size: 11px; margin: 2px 0; }
        </style>
      </head>
      <body>
        <div class="center bold" style="font-size: 14px;">${company.name}</div>
        <div class="center" style="font-size: 10px;">${company.tagline || 'Commerce Général'}</div>
        <div class="center" style="font-size: 10px;">IFU : ${company.ifu}</div>
        <div class="center" style="font-size: 10px;">Tél : ${company.phone}</div>
        
        <div class="divider"></div>
        <div class="row"><span>Ticket N° :</span><span class="bold">${sale.invoiceNumber}</span></div>
        <div class="row"><span>Date :</span><span>${formatDateTimeFr(sale.createdAt)}</span></div>
        <div class="row"><span>Caissier :</span><span>${sale.cashierName}</span></div>
        ${sale.customerName ? `<div class="row"><span>Client :</span><span class="bold">${sale.customerName}</span></div>` : ''}

        <div class="divider"></div>
        ${itemsHtml}

        <div class="divider"></div>
        <div class="row" style="font-size: 13px; font-weight: bold;">
          <span>TOTAL NET :</span>
          <span>${formatCFA(sale.total)}</span>
        </div>
        <div class="row"><span>Mode :</span><span class="bold">${sale.paymentMethod.toUpperCase()}</span></div>
        <div class="row"><span>Reçu :</span><span>${formatCFA(sale.received)}</span></div>
        <div class="row"><span>Rendu :</span><span class="bold">${formatCFA(sale.change)}</span></div>

        <div class="divider"></div>
        <div class="center" style="font-size: 10px; margin-top: 6px;">
          Merci de votre confiance !<br>
          Les marchandises vendues ne sont ni reprises ni échangées.
        </div>
        <div style="height: 15px;"></div>
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
              window.close();
            }, 300);
          };
        </script>
      </body>
      </html>
    `;

    printWin.document.write(htmlContent);
    printWin.document.close();
  }

  private async renderReceiptToEscPosBytes(sale: Sale, company: CompanySettings): Promise<Uint8Array> {
    // 384px wide canvas (standard 58mm at 203 DPI)
    const canvas = document.createElement('canvas');
    canvas.width = 384;
    canvas.height = 800; // auto-adjusted
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#000000';
    ctx.textBaseline = 'top';

    let y = 10;
    // Header
    ctx.font = 'bold 22px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(company.name, 192, y);
    y += 28;

    ctx.font = '14px monospace';
    ctx.fillText('IFU: ' + company.ifu, 192, y);
    y += 20;
    ctx.fillText('Tél: ' + company.phone, 192, y);
    y += 25;

    // Divider
    ctx.fillRect(10, y, 364, 2);
    y += 10;

    ctx.textAlign = 'left';
    ctx.font = '14px monospace';
    ctx.fillText(`Ticket: ${sale.invoiceNumber}`, 10, y);
    y += 20;
    ctx.fillText(`Date: ${formatDateTimeFr(sale.createdAt)}`, 10, y);
    y += 20;
    ctx.fillText(`Caisse: ${sale.cashierName}`, 10, y);
    y += 25;

    ctx.fillRect(10, y, 364, 1);
    y += 10;

    // Items
    for (const it of sale.items) {
      ctx.font = 'bold 15px monospace';
      ctx.fillText(it.name.substring(0, 24), 10, y);
      ctx.textAlign = 'right';
      ctx.fillText(Math.round(it.total).toLocaleString('fr-FR') + ' F', 374, y);
      y += 20;

      ctx.textAlign = 'left';
      ctx.font = '13px monospace';
      ctx.fillText(`${it.qty} x ${Math.round(it.priceUnit).toLocaleString('fr-FR')}`, 10, y);
      y += 22;
    }

    ctx.fillRect(10, y, 364, 2);
    y += 15;

    // Totals
    ctx.font = 'bold 20px monospace';
    ctx.fillText('TOTAL:', 10, y);
    ctx.textAlign = 'right';
    ctx.fillText(formatCFA(sale.total), 374, y);
    y += 30;

    ctx.textAlign = 'left';
    ctx.font = '14px monospace';
    ctx.fillText(`Reçu: ${formatCFA(sale.received)}`, 10, y);
    y += 20;
    ctx.fillText(`Rendu: ${formatCFA(sale.change)}`, 10, y);
    y += 30;

    ctx.textAlign = 'center';
    ctx.font = '13px monospace';
    ctx.fillText('Merci de votre visite !', 192, y);
    y += 40;

    // Convert canvas bitmap to ESC/POS Raster command: GS v 0 0
    const imgData = ctx.getImageData(0, 0, 384, y);
    return this.canvasToEscPosRaster(imgData, 384, y);
  }

  private canvasToEscPosRaster(imgData: ImageData, width: number, height: number): Uint8Array {
    const widthBytes = width / 8; // 48 bytes
    const data = imgData.data;
    const rasterBytes: number[] = [
      0x1b, 0x40, // ESC @ (Initialize)
      0x1d, 0x76, 0x30, 0x00, // GS v 0 0 (Raster bit image)
      widthBytes & 0xff, (widthBytes >> 8) & 0xff,
      height & 0xff, (height >> 8) & 0xff
    ];

    for (let row = 0; row < height; row++) {
      for (let colByte = 0; colByte < widthBytes; colByte++) {
        let byteVal = 0;
        for (let bit = 0; bit < 8; bit++) {
          const pixelX = colByte * 8 + bit;
          const pixelIndex = (row * width + pixelX) * 4;
          const r = data[pixelIndex];
          const g = data[pixelIndex + 1];
          const b = data[pixelIndex + 2];
          const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
          if (luminance < 128) {
            byteVal |= (1 << (7 - bit));
          }
        }
        rasterBytes.push(byteVal);
      }
    }

    // Feed and cut
    rasterBytes.push(0x1b, 0x64, 0x04); // ESC d 4 (Feed 4 lines)
    rasterBytes.push(0x1d, 0x56, 0x41, 0x00); // GS V 65 0 (Full cut)

    return new Uint8Array(rasterBytes);
  }

  private async sendBytesInChunks(bytes: Uint8Array, chunkSize = 100): Promise<void> {
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.slice(i, i + chunkSize);
      await this.characteristic.writeValue(chunk);
      // Brief sleep between chunks to avoid Bluetooth buffer overflow
      await new Promise(r => setTimeout(r, 20));
    }
  }
}

export const thermalPrinter = new BluetoothThermalPrinter();
