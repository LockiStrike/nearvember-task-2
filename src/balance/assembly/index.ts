import { storage, Context } from "near-sdk-core"
import {HistoryRecord} from "./history-record";

@nearBindgen
export class Contract {

  readonly NEGATIVE_AMOUNT_ERROR: string = '🚫 Amount can only be a positive number';
  readonly AMOUNT_BIGGER_BALANCE_ERROR: string = '🚫 You cannot spend more than you have';
  readonly NOTE_LENGTH_ERROR: string = '🚫 Note cannot be longer than 255 symbols';
  readonly INVALID_INDEX_ERROR: string = '🚫 Transaction index is not valid';

  readonly NOTE_LENGTH_LIMIT: number = 255;

  private balance: number = 0.0;
  private lastIndex: number = 0;

  // return the string 'hello world'
  getBalance(): string {
    return `Your balance: ${this.balance}`;
  }

  // read the given key from account (contract) storage
  getHistory(): string {
    const history = '';

    for (let i = 0; i <= this.lastIndex; i++) {
      const record = storage.get<HistoryRecord>(i.toString());
      if (!record) {
        continue;
      }

      history.concat(this.buildStringFromHistoryRecord(i, record));
    }

    return history;
  }

  getTransactionDetails(index: string): string {
    const parsedIndex = parseInt(index);
    if (isNaN(parsedIndex)) {
      return this.INVALID_INDEX_ERROR;
    }

    if (isKeyInStorage(index)) {
      return this.buildStringFromHistoryRecord(parsedIndex, storage.get<HistoryRecord>(index.toString()) as HistoryRecord);
    } else {
      return `🚫 Key [ ${index} ] not found in storage. ( ${this.storageReport()} )`
    }
  }

  // write the given value at the given key to account (contract) storage
  @mutateState()
  spent(amount: number, note: string): string {
    if (this.isAmountNegative(amount)) {
      return this.NEGATIVE_AMOUNT_ERROR;
    }

    if (amount > this.balance) {
      return this.AMOUNT_BIGGER_BALANCE_ERROR;
    }

    if (this.noteExceedLengthLimit(note)) {
      return this.NOTE_LENGTH_ERROR;
    }

    this.lastIndex++;
    const newBalance = this.balance - amount;
    storage.set<HistoryRecord>(this.lastIndex.toString(), {action: 'spent', amount, note, newBalance});
    this.balance = newBalance;
    return `✅ Data saved. ( ${this.storageReport()} )`
  }

  @mutateState()
  receive(amount: number, note: string): string {
    if (this.isAmountNegative(amount)) {
      return this.NEGATIVE_AMOUNT_ERROR;
    }

    if (this.noteExceedLengthLimit(note)) {
      return this.NOTE_LENGTH_ERROR;
    }

    this.lastIndex++;
    const newBalance = this.balance + amount;
    storage.set<HistoryRecord>(this.lastIndex.toString(), {action: 'received', amount, note, newBalance})
    this.balance = newBalance;
    return `✅ Data saved. ( ${this.storageReport()} )`
  }

  private isAmountNegative(amount: number): boolean {
    return !amount || amount < 0;
  }

  private noteExceedLengthLimit(note: string): boolean {
    return !!note && note.length > this.NOTE_LENGTH_LIMIT;
  }

// private helper method used by read() and write() above
  private storageReport(): string {
    return `storage [ ${Context.storageUsage} bytes ]`
  }

  private buildStringFromHistoryRecord(index: number, record: HistoryRecord): string {
    return `[${index}]. ${record.action} ${record.amount}, newBalance: ${record.newBalance}. Note: ${record.note} \n`;
  }
}

/**
 * This function exists only to avoid a compiler error
 *

ERROR TS2339: Property 'contains' does not exist on type 'src/singleton/assembly/index/Contract'.

     return this.contains(key);
                 ~~~~~~~~
 in ~lib/near-sdk-core/storage.ts(119,17)

/Users/sherif/Documents/code/near/_projects/edu.t3/starter--near-sdk-as/node_modules/asbuild/dist/main.js:6
        throw err;
        ^

 * @param key string key in account storage
 * @returns boolean indicating whether key exists
 */
function isKeyInStorage(key: string): bool {
  return storage.hasKey(key)
}
