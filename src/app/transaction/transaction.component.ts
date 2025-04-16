import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { LocalStorageService } from '../local-storage.service';
import { CommonModule } from '@angular/common';

interface Transaction {
  id: number;
  atmCardId: number;
  type: 'deposit' | 'withdrawal' | 'reversal';
  amount: number;
  date: string;
  reversed?: boolean;
}

@Component({
  selector: 'app-transaction',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './transaction.component.html',
  styleUrls: ['./transaction.component.css']
})
export class TransactionComponent {
  transactionForm: FormGroup;
  transactions: Transaction[] = [];
  atmCards: any[] = []; // load from localStorage 'atmCards'
  accounts: any[] = []; // load from localStorage 'accounts'
  editingTxn: Transaction | null = null;

  constructor(private fb: FormBuilder, private ls: LocalStorageService) {
    this.transactionForm = this.fb.group({
      atmCardId: ['', Validators.required],
      type: ['deposit', Validators.required],
      amount: [0, [Validators.required, Validators.min(1)]]
    });
    this.loadTransactions();
    this.loadAtmCards();
    this.loadAccounts();
  }

  loadTransactions(): void {
    this.transactions = this.ls.getData('transactions');
  }

  loadAtmCards(): void {
    this.atmCards = this.ls.getData('atmCards');
  }

  loadAccounts(): void {
    this.accounts = this.ls.getData('accounts');
  }

  saveTransactions(): void {
    this.ls.setData('transactions', this.transactions);
  }

  saveAccounts(): void {
    this.ls.setData('accounts', this.accounts);
  }

  updateAccountBalance(atmCardId: number, amount: number, type: 'deposit' | 'withdrawal'): void {
    // Find the related account via atm card mapping
    const atmCard = this.atmCards.find(card => card.id == atmCardId);
    if (!atmCard) return;
    const account = this.accounts.find(acc => acc.id == atmCard.accountId);
    if (!account) return;
    if(type === 'deposit'){
      account.balance = (account.balance || 0) + amount;
    } else {
      account.balance = (account.balance || 0) - amount;
    }
    this.saveAccounts();
  }

  onSubmit(): void {
    if (this.transactionForm.invalid) return;
    const formValue = this.transactionForm.value;

    if(this.editingTxn){
      // For simplicity, editing a transaction is not allowed after affecting the balance.
      alert('Editing a transaction is not supported.');
      return;
    } else {
      const newId = this.transactions.length > 0 ? Math.max(...this.transactions.map(t => t.id)) + 1 : 1;
      const txn: Transaction = {
        id: newId,
        atmCardId: +formValue.atmCardId,
        type: formValue.type,
        amount: +formValue.amount,
        date: new Date().toISOString()
      };
      this.transactions.push(txn);
      // Update account balance based on transaction type (only for deposit/withdrawal)
      if(txn.type === 'deposit' || txn.type === 'withdrawal'){
        this.updateAccountBalance(txn.atmCardId, txn.amount, txn.type);
      }
    }
    this.saveTransactions();
    this.transactionForm.reset({ type: 'deposit', amount: 0 });
  }

  onReverse(txn: Transaction): void {
    if(confirm('Are you sure you want to reverse this transaction?')){
      // Mark original transaction as reversed
      txn.reversed = true;
      // Create a reversal transaction (opposite type, same amount)
      const reversalType = txn.type === 'deposit' ? 'withdrawal' : 'deposit';
      const newId = this.transactions.length > 0 ? Math.max(...this.transactions.map(t => t.id)) + 1 : 1;
      const reversalTxn: Transaction = {
        id: newId,
        atmCardId: txn.atmCardId,
        type: 'reversal',
        amount: txn.amount,
        date: new Date().toISOString()
      };
      this.transactions.push(reversalTxn);
      // Reverse the account balance effect by applying opposite operation
      this.updateAccountBalance(txn.atmCardId, txn.amount, reversalType as ('deposit' | 'withdrawal'));
      this.saveTransactions();
    }
  }

  onDelete(txn: Transaction): void {
    if(confirm('Are you sure you want to delete this transaction?')){
      this.transactions = this.transactions.filter(t => t.id !== txn.id);
      this.saveTransactions();
    }
  }
}
