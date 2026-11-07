export function numberToWords(n: number): string {
  if (isNaN(n) || n === 0) return 'zéro';
  n = Math.round(Math.abs(n));

  const units = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf'];
  const teens = ['dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
  const tens = ['', 'dix', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante-dix', 'quatre-vingts', 'quatre-vingt-dix'];

  function convertHundreds(num: number): string {
    let str = '';
    const h = Math.floor(num / 100);
    const rest = num % 100;

    if (h > 0) {
      if (h === 1) str += 'cent ';
      else str += units[h] + ' cent' + (rest === 0 ? 's ' : ' ');
    }

    if (rest > 0) {
      if (rest < 10) {
        str += units[rest] + ' ';
      } else if (rest >= 10 && rest < 20) {
        str += teens[rest - 10] + ' ';
      } else {
        const t = Math.floor(rest / 10);
        const u = rest % 10;
        if (t === 7) {
          str += 'soixante-' + (u === 1 ? 'et-onze ' : teens[u] + ' ');
        } else if (t === 9) {
          str += 'quatre-vingt-' + teens[u] + ' ';
        } else {
          let tenStr = tens[t];
          if (t === 8 && u === 0) tenStr = 'quatre-vingts';
          if (u === 1 && t !== 8) {
            str += tenStr + '-et-un ';
          } else if (u > 0) {
            str += tenStr + '-' + units[u] + ' ';
          } else {
            str += tenStr + ' ';
          }
        }
      }
    }
    return str.trim();
  }

  const billions = Math.floor(n / 1000000000);
  const millions = Math.floor((n % 1000000000) / 1000000);
  const thousands = Math.floor((n % 1000000) / 1000);
  const remainder = n % 1000;

  let result = '';

  if (billions > 0) {
    result += (billions === 1 ? 'un milliard ' : convertHundreds(billions) + ' milliards ');
  }
  if (millions > 0) {
    result += (millions === 1 ? 'un million ' : convertHundreds(millions) + ' millions ');
  }
  if (thousands > 0) {
    result += (thousands === 1 ? 'mille ' : convertHundreds(thousands) + ' mille ');
  }
  if (remainder > 0) {
    result += convertHundreds(remainder);
  }

  result = result.trim();
  return result.charAt(0).toUpperCase() + result.slice(1);
}
