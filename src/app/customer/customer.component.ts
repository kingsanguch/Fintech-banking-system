import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { LocalStorageService } from '../local-storage.service';
import { CommonModule } from '@angular/common';

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
}

@Component({
  selector: 'app-customer',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.css']
})
export class CustomerComponent {
  customerForm: FormGroup;
  customers: Customer[] = [];
  editingCustomer: Customer | null = null;

  constructor(private fb: FormBuilder, private ls: LocalStorageService) {
    this.customerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required]
    });
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.customers = this.ls.getData('customers');
  }

  saveCustomers(): void {
    this.ls.setData('customers', this.customers);
  }

  onSubmit(): void {
    if (this.customerForm.invalid) {
      return;
    }

    const formValue = this.customerForm.value;
    if (this.editingCustomer) {
      // Update operation
      const index = this.customers.findIndex(c => c.id === this.editingCustomer!.id);
      if (index > -1) {
        this.customers[index] = { id: this.editingCustomer!.id, ...formValue };
      }
      this.editingCustomer = null;
    } else {
      // Create operation: generate a new id based on max id +1
      const newId = this.customers.length > 0 ? Math.max(...this.customers.map(c => c.id)) + 1 : 1;
      this.customers.push({ id: newId, ...formValue });
    }
    this.saveCustomers();
    this.customerForm.reset();
  }

  onEdit(customer: Customer): void {
    this.editingCustomer = customer;
    this.customerForm.patchValue(customer);
  }

  onDelete(customer: Customer): void {
    if(confirm(`Are you sure you want to delete ${customer.name}?`)){
      this.customers = this.customers.filter(c => c.id !== customer.id);
      this.saveCustomers();
    }
  }

  onCancelEdit(): void {
    this.editingCustomer = null;
    this.customerForm.reset();
  }
}
