export function printA4Element(elementId: string, docTitle = 'Document-A4'): void {
  const element = document.getElementById(elementId);
  if (!element) {
    alert(`Élément #${elementId} introuvable pour l'impression A4.`);
    return;
  }

  const printWin = window.open('', '_blank', 'width=950,height=850');
  if (!printWin) {
    window.print();
    return;
  }

  const html = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="utf-8">
      <title>${docTitle} - Impression A4 Officielle</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <style>
        @page {
          size: A4;
          margin: 8mm;
        }
        body {
          font-family: system-ui, -apple-system, sans-serif;
          background: #ffffff !important;
          color: #000000 !important;
          margin: 0;
          padding: 12px;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        table {
          border-collapse: collapse;
          width: 100%;
        }
      </style>
    </head>
    <body>
      ${element.outerHTML}
      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
            window.close();
          }, 400);
        };
      </script>
    </body>
    </html>
  `;

  printWin.document.write(html);
  printWin.document.close();
}
