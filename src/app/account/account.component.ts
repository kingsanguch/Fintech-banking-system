import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { LocalStorageService } from '../local-storage.service';
import { CommonModule } from '@angular/common';

interface Account {
  id: number;
  accountNumber: string;
  customerId: number;
  balance: number;
}

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css']
})
export class AccountComponent {
  accountForm: FormGroup;
  accounts: Account[] = [];
  customers: any[] = [];  // minimal info; loaded from localStorage 'customers'
  editingAccount: Account | null = null;

  constructor(private fb: FormBuilder, private ls: LocalStorageService) {
    this.accountForm = this.fb.group({
      accountNumber: ['', Validators.required],
      customerId: ['', Validators.required],
      balance: [0, Validators.required]
    });
    this.loadAccounts();
    this.loadCustomers();
  }

  loadAccounts(): void {
    this.accounts = this.ls.getData('accounts');
  }

  loadCustomers(): void {
    this.customers = this.ls.getData('customers');
  }

  saveAccounts(): void {
    this.ls.setData('accounts', this.accounts);
  }

  onSubmit(): void {
    if (this.accountForm.invalid) {
      return;
    }
    const formValue = this.accountForm.value;
    // Check for uniqueness: accountNumber must not be linked to another customer
    const exists = this.accounts.find(acc => acc.accountNumber === formValue.accountNumber && 
                   (!this.editingAccount || acc.id !== this.editingAccount.id));
    if (exists) {
      alert('This account number is already assigned.');
      return;
    }

    if (this.editingAccount) {
      const index = this.accounts.findIndex(a => a.id === this.editingAccount!.id);
      this.accounts[index] = { id: this.editingAccount!.id, ...formValue };
      this.editingAccount = null;
    } else {
      const newId = this.accounts.length > 0 ? Math.max(...this.accounts.map(a => a.id)) + 1 : 1;
      this.accounts.push({ id: newId, ...formValue });
    }
    this.saveAccounts();
    this.accountForm.reset({ balance: 0 });
  }

  onEdit(account: Account): void {
    this.editingAccount = account;
    this.accountForm.patchValue(account);
  }

  onDelete(account: Account): void {
    if(confirm('Are you sure you want to delete this account?')){
      this.accounts = this.accounts.filter(a => a.id !== account.id);
      this.saveAccounts();
    }
  }

  onCancelEdit(): void {
    this.editingAccount = null;
    this.accountForm.reset({ balance: 0 });
  }
}
