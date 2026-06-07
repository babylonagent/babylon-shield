import { Interface, MaxUint256 } from 'ethers';
import type { ApprovalChange } from '../types.js';
const iface = new Interface(['function approve(address spender,uint256 amount) returns (bool)','function increaseAllowance(address spender,uint256 addedValue) returns (bool)']);
const selectors = new Set([iface.getFunction('approve')!.selector.toLowerCase(), iface.getFunction('increaseAllowance')!.selector.toLowerCase()]);
export function decodeApprovalCall(input: { from: string; to: string; data?: string }): ApprovalChange | null {
  if (!input.data || input.data === '0x' || !selectors.has(input.data.slice(0, 10).toLowerCase())) return null;
  try { const decoded = iface.parseTransaction({ data: input.data }); if (!decoded) return null; const amount = decoded.args[1];
    return { token: input.to, owner: input.from, spender: String(decoded.args[0]), amount: amount.toString(), unlimited: amount === MaxUint256 };
  } catch { return null; }
}
