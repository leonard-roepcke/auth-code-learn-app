export function generateCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function formatCode(code: string): string {
  return `${code.slice(0, 3)} ${code.slice(3)}`;
}
