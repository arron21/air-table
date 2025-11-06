import { TemplateRef } from '@angular/core';

export interface ColumnDefinition<T = any> {
  key: keyof T | string;
  header: string;
  sortable?: boolean;
  filterable?: boolean;
  cellTemplate?: TemplateRef<{ $implicit: T; column: ColumnDefinition<T> }>;
}

