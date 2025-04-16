import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
  // Generic getter for any key (returns array)
  getData(key: string): any[] {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  // Generic setter to update key with new array data
  setData(key: string, data: any[]): void {
    localStorage.setItem(key, JSON.stringify(data));
  }
}
