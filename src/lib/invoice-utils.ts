// Utility functions for invoice operations

export function calculateFinancialYear(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // JavaScript months are 0-indexed
  
  if (month >= 4) {
    // April to December - current year is the start year
    return `${year}-${(year + 1).toString().slice(-2)}`;
  } else {
    // January to March - previous year is the start year
    return `${year - 1}-${year.toString().slice(-2)}`;
  }
}

export function convertToWords(amount: number): string {
  if (amount === 0) return "Zero Only";
  
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

  function convertTwoDigit(num: number): string {
    if (num === 0) return '';
    if (num < 10) return ones[num];
    if (num < 20) return teens[num - 10];
    return tens[Math.floor(num / 10)] + (num % 10 ? ' ' + ones[num % 10] : '');
  }

  function convertThreeDigit(num: number): string {
    if (num === 0) return '';
    let result = '';
    if (num >= 100) {
      result = ones[Math.floor(num / 100)] + ' Hundred';
      num %= 100;
      if (num > 0) result += ' And ';
    }
    result += convertTwoDigit(num);
    return result;
  }

  // Handle Indian numbering system (Lakhs and Crores)
  const crore = Math.floor(amount / 10000000);
  amount %= 10000000;
  const lakh = Math.floor(amount / 100000);
  amount %= 100000;
  const thousand = Math.floor(amount / 1000);
  amount %= 1000;
  const hundred = Math.floor(amount);
  const decimal = Math.round((amount - hundred) * 100);

  let result = '';
  
  if (crore > 0) result += convertTwoDigit(crore) + ' Crore ';
  if (lakh > 0) result += convertTwoDigit(lakh) + ' Lakh ';
  if (thousand > 0) result += convertTwoDigit(thousand) + ' Thousand ';
  if (hundred > 0) result += convertThreeDigit(hundred);
  
  result = result.trim();
  
  if (decimal > 0) {
    result += ' And ' + convertTwoDigit(decimal) + ' Paise';
  }
  
  return result + ' Only';
}

export function validateGSTIN(gstin: string): boolean {
  // Indian GSTIN format: 2 digits (state code) + 10 chars (PAN) + 1 digit (entity number) + 1 char (Z) + 1 check digit
  const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return gstinRegex.test(gstin);
}

export function validatePAN(pan: string): boolean {
  // Indian PAN format: 5 letters + 4 digits + 1 letter
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  return panRegex.test(pan);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function generateInvoiceNumber(counter: number, prefix: string = ''): string {
  return `${prefix}${counter}`;
}
