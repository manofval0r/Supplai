export type ParsedSms =
  | { kind: 'request'; medicine: string; quantity: number }
  | { kind: 'confirm'; reference: string }
  | { kind: 'decline'; reference: string }
  | { kind: 'invalid' };

export function parseSms(body: string): ParsedSms {
  const normalized = body.trim().replace(/\s+/g, ' ');
  const request = /^need\s+(.+?)\s+(\d+)$/i.exec(normalized);
  if (request) {
    const quantity = Number(request[2]);
    if (Number.isSafeInteger(quantity) && quantity > 0 && quantity <= 10_000) {
      return { kind: 'request', medicine: request[1]!.trim(), quantity };
    }
  }

  const reply = /^(confirm|yes|decline|no)\s+([a-z0-9-]+)$/i.exec(normalized);
  if (reply) {
    return {
      kind: /^(confirm|yes)$/i.test(reply[1]!) ? 'confirm' : 'decline',
      reference: reply[2]!.toUpperCase(),
    };
  }

  return { kind: 'invalid' };
}

export function normalizeMedicineTerm(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}
