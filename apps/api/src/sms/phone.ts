export function normalizeNigerianPhone(input: string): string {
  const compact = input.trim().replace(/[\s()-]/g, '');
  let digits: string;

  if (compact.startsWith('+234')) digits = compact.slice(1);
  else if (compact.startsWith('234')) digits = compact;
  else if (compact.startsWith('0')) digits = `234${compact.slice(1)}`;
  else if (/^[789]\d{9}$/.test(compact)) digits = `234${compact}`;
  else throw new Error('Invalid Nigerian phone number');

  if (!/^234[789]\d{9}$/.test(digits)) {
    throw new Error('Invalid Nigerian phone number');
  }

  return `+${digits}`;
}
