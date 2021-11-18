@nearBindgen
export class HistoryRecord {
    amount: f64;
    newBalance: f64;
    action: string;
    note: string;

    constructor(amount: f64, newBalance: f64, action: string, note: string) {
        this.amount = amount
        this.newBalance = newBalance;
        this.action = action;
        this.note = note;
    }
}