import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { CustomerComponent } from './customer/customer.component';
import { AccountComponent } from './account/account.component';
import { AtmCardComponent } from './atm-card/atm-card.component';
import { TransactionComponent } from './transaction/transaction.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: 'customer', component: CustomerComponent },
      { path: 'account', component: AccountComponent },
      { path: 'atm-card', component: AtmCardComponent },
      { path: 'transaction', component: TransactionComponent },
      { path: '', redirectTo: 'customer', pathMatch: 'full' }
    ]
  }
];
