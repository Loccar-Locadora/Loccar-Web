import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="isOpen" class="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-md">
        <!-- Header -->
        <div class="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 class="text-xl font-semibold text-gray-900">{{ title }}</h2>
          <button (click)="onCancel()" class="text-gray-400 hover:text-gray-600">
            <i class="bi bi-x-lg text-xl"></i>
          </button>
        </div>

        <!-- Content -->
        <div class="p-6">
          <div class="flex items-center mb-4">
            <div class="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mr-4">
              <i class="bi bi-exclamation-triangle text-red-600 text-2xl"></i>
            </div>
            <div>
              <h3 class="text-lg font-medium text-gray-900">{{ message }}</h3>
              <p class="text-gray-500 mt-1" *ngIf="description">{{ description }}</p>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            type="button"
            (click)="onCancel()"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            {{ cancelText }}
          </button>
          <button
            type="button"
            (click)="onConfirm()"
            [disabled]="isLoading"
            class="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed">
            <span *ngIf="!isLoading">{{ confirmText }}</span>
            <span *ngIf="isLoading" class="flex items-center">
              <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Excluindo...
            </span>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class ConfirmationModalComponent {
  @Input() isOpen = false;
  @Input() title = 'Confirmar Ação';
  @Input() message = 'Tem certeza que deseja continuar?';
  @Input() description = '';
  @Input() confirmText = 'Confirmar';
  @Input() cancelText = 'Cancelar';
  @Input() isLoading = false;
  
  @Output() confirmEvent = new EventEmitter<void>();
  @Output() cancelEvent = new EventEmitter<void>();

  onConfirm(): void {
    this.confirmEvent.emit();
  }

  onCancel(): void {
    this.cancelEvent.emit();
  }
}