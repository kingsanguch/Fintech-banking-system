import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { LocalStorageService } from '../local-storage.service';
import { CommonModule } from '@angular/common';

interface ATMCard {
  id: number;
  cardNumber: string;
  accountId: number;
}

@Component({
  selector: 'app-atm-card',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './atm-card.component.html',
  styleUrls: ['./atm-card.component.css']
})
export class AtmCardComponent {
  atmForm: FormGroup;
  atmCards: ATMCard[] = [];
  accounts: any[] = []; // load accounts from localStorage
  editingATM: ATMCard | null = null;

  constructor(private fb: FormBuilder, private ls: LocalStorageService) {
    this.atmForm = this.fb.group({
      cardNumber: ['', Validators.required],
      accountId: ['', Validators.required]
    });
    this.loadAtmCards();
    this.loadAccounts();
  }

  loadAtmCards(): void {
    this.atmCards = this.ls.getData('atmCards');
  }

  loadAccounts(): void {
    this.accounts = this.ls.getData('accounts');
  }

  saveAtmCards(): void {
    this.ls.setData('atmCards', this.atmCards);
  }

  onSubmit(): void {
    if(this.atmForm.invalid) return;
    const formValue = this.atmForm.value;
    // Ensure the card number is unique (not assigned to another account)
    const exists = this.atmCards.find(card => card.cardNumber === formValue.cardNumber && 
                    (!this.editingATM || card.id !== this.editingATM.id));
    if(exists){
      alert('This ATM card number is already assigned.');
      return;
    }
    if(this.editingATM){
      const index = this.atmCards.findIndex(c => c.id === this.editingATM!.id);
      this.atmCards[index] = { id: this.editingATM!.id, ...formValue };
      this.editingATM = null;
    } else {
      const newId = this.atmCards.length > 0 ? Math.max(...this.atmCards.map(c => c.id)) + 1 : 1;
      this.atmCards.push({ id: newId, ...formValue });
    }
    this.saveAtmCards();
    this.atmForm.reset();
  }

  onEdit(card: ATMCard): void {
    this.editingATM = card;
    this.atmForm.patchValue(card);
  }

  onDelete(card: ATMCard): void {
    if(confirm('Are you sure you want to delete this ATM mapping?')){
      this.atmCards = this.atmCards.filter(c => c.id !== card.id);
      this.saveAtmCards();
    }
  }

  onCancelEdit(): void {
    this.editingATM = null;
    this.atmForm.reset();
  }
}
