import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TableComponent } from './components/table/table.component';
import { ColumnDefinition } from './components/table/column-definition';
import { dummyUsers, User } from './data/dummy-data';

@Component({
  selector: 'app-root',
  imports: [TableComponent, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('air-table');
  protected readonly users = signal(dummyUsers);
  
  // External search and filter controls
  protected readonly externalSearchQuery = signal<string>('');
  protected readonly showActiveOnly = signal<boolean>(false);
  
  // External filter function - filters by active status
  protected readonly externalFilter = computed<((row: User) => boolean) | undefined>(() => {
    if (this.showActiveOnly()) {
      return (user: User) => user.status === 'active';
    }
    return undefined;
  });
  
  protected readonly columns: ColumnDefinition<User>[] = [
    {
      key: 'id',
      header: 'ID',
      sortable: true
    },
    {
      key: 'name',
      header: 'Name',
      sortable: true
    },
    {
      key: 'email',
      header: 'Email',
      sortable: true
    },
    {
      key: 'role',
      header: 'Role',
      sortable: true
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true
    },
    {
      key: 'createdAt',
      header: 'Created At',
      sortable: true
    },
    {
      key: 'salary',
      header: 'Salary',
      sortable: true
    }
  ];
  
  protected onExternalSearchChange(value: string): void {
    this.externalSearchQuery.set(value);
  }
  
  protected clearExternalSearch(): void {
    this.externalSearchQuery.set('');
  }

  // Apply button pattern - temporary values and applied values
  protected readonly pendingSearchQuery = signal<string>('');
  protected readonly pendingShowActiveOnly = signal<boolean>(false);
  
  // Applied values (sent to table)
  protected readonly appliedSearchQuery = signal<string>('');
  protected readonly appliedShowActiveOnly = signal<boolean>(false);
  
  // Applied filter function
  protected readonly appliedExternalFilter = computed<((row: User) => boolean) | undefined>(() => {
    if (this.appliedShowActiveOnly()) {
      return (user: User) => user.status === 'active';
    }
    return undefined;
  });

  protected onPendingSearchChange(value: string): void {
    this.pendingSearchQuery.set(value);
  }

  protected clearPendingSearch(): void {
    this.pendingSearchQuery.set('');
  }

  protected applyFilters(): void {
    this.appliedSearchQuery.set(this.pendingSearchQuery());
    this.appliedShowActiveOnly.set(this.pendingShowActiveOnly());
  }

  protected resetFilters(): void {
    this.pendingSearchQuery.set('');
    this.pendingShowActiveOnly.set(false);
    this.appliedSearchQuery.set('');
    this.appliedShowActiveOnly.set(false);
  }

  protected readonly hasPendingChanges = computed(() => {
    return (
      this.pendingSearchQuery() !== this.appliedSearchQuery() ||
      this.pendingShowActiveOnly() !== this.appliedShowActiveOnly()
    );
  });

  // Selection examples
  protected readonly selectedUsers = signal<User[]>([]);
  protected readonly singleSelectedUser = signal<User | undefined>(undefined);

  protected readonly selectedUserNames = computed(() => {
    return this.selectedUsers().map(u => u.name).join(', ');
  });

  protected onSelectionChange(selected: User[]): void {
    this.selectedUsers.set(selected);
  }

  protected onSingleSelectionChange(selected: User[]): void {
    this.singleSelectedUser.set(selected[0]);
  }

  protected getUserIdentifier = (user: User): number => user.id;
}
