/**
 * Derive PO/vPC ID from a list of interface names.
 * Takes the lowest-numbered interface and string-concats module+port.
 * Eth1/12 -> 112, Eth2/5 -> 25
 */
export function deriveIdFromInterfaces(interfaces: string[]): number | null {
  const parsed: [number, number][] = [];
  for (const iface of interfaces) {
    const match = iface.match(/(?:Ethernet|Eth)\s*(\d+)\/(\d+)/i);
    if (match) {
      parsed.push([parseInt(match[1]), parseInt(match[2])]);
    }
  }
  if (parsed.length === 0) return null;
  parsed.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const [mod, port] = parsed[0];
  return parseInt(`${mod}${port}`);
}
