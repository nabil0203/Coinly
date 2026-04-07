export interface LedgerEntry {
  _id?: string;
  description: string;
  amount: number | string;
  payment_method: string;
}

export interface LedgerRow {
  isFirst: boolean;
  isLast: boolean;
  day: number;
  dayName: string;
  dateStr: string;
  rowCount: number;
  exp: LedgerEntry | null;
  inc: LedgerEntry | null;
  currentBalance: number;
  dailyExpenseTotal?: number;
  dayEndBalance?: number;
  index: number;
  expSpan?: number;
  incSpan?: number;
  isExpStart?: boolean;
  isIncStart?: boolean;
}
