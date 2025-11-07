import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TableComponent } from './components/table/table.component';
import { ColumnDefinition } from './components/table/column-definition';
import { dummyUsers, User, generateLargeUserDataset } from './data/dummy-data';
import { PostsService, Post } from './services/posts.service';

@Component({
  selector: 'app-root',
  imports: [TableComponent, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  constructor(protected postsService: PostsService) {
    // Initialize posts data
    this.loadPosts();
  }
  protected readonly title = signal('air-table');
  protected readonly users = signal(dummyUsers);
  protected readonly largeDataset = signal(generateLargeUserDataset(10000));
  
  // Toggle control mode demo
  protected readonly useExternalControls = signal<boolean>(false);
  protected readonly toggleSearchQuery = signal<string>('');
  protected readonly toggleShowActiveOnly = signal<boolean>(false);
  
  // Toggle external filter function
  protected readonly toggleExternalFilter = computed<((row: User) => boolean) | undefined>(() => {
    if (this.toggleShowActiveOnly()) {
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
  
  // Toggle control mode methods
  protected setControlMode(useExternal: boolean): void {
    this.useExternalControls.set(useExternal);
    // Clear toggle search when switching modes to avoid confusion
    if (!useExternal) {
      this.toggleSearchQuery.set('');
      this.toggleShowActiveOnly.set(false);
    }
  }

  protected onToggleSearchChange(value: string): void {
    this.toggleSearchQuery.set(value);
  }

  protected clearToggleSearch(): void {
    this.toggleSearchQuery.set('');
  }

  // Selection examples
  protected readonly selectedUsers = signal<User[]>([]);

  protected readonly selectedUserNames = computed(() => {
    return this.selectedUsers().map(u => u.name).join(', ');
  });

  protected onSelectionChange(selected: User[]): void {
    this.selectedUsers.set(selected);
  }

  protected getUserIdentifier = (user: User): number => user.id;

  // Large dataset statistics
  protected readonly activeUsersCount = computed(() => {
    return this.largeDataset().filter(u => u.status === 'active').length;
  });

  protected readonly uniqueRolesCount = computed(() => {
    return new Set(this.largeDataset().map(u => u.role)).size;
  });

  // External pagination demo with API
  protected readonly posts = signal<Post[]>([]);
  protected readonly currentPage = signal<number>(1);
  protected readonly totalPosts = signal<number>(0);
  protected readonly postsPerPage = 10;
  
  protected readonly totalPages = computed(() => {
    return Math.ceil(this.totalPosts() / this.postsPerPage);
  });

  protected readonly postsColumns: ColumnDefinition<Post>[] = [
    {
      key: 'id',
      header: 'ID',
      sortable: false
    },
    {
      key: 'title',
      header: 'Title',
      sortable: false
    },
    {
      key: 'body',
      header: 'Content',
      sortable: false
    },
    {
      key: 'userId',
      header: 'User ID',
      sortable: false
    }
  ];

  private async loadPosts(): Promise<void> {
    try {
      const response = await this.postsService.fetchPosts(this.currentPage(), this.postsPerPage);
      this.posts.set(response.posts);
      this.totalPosts.set(response.total);
    } catch (error) {
      console.error('Failed to load posts:', error);
      // Set empty state on error
      this.posts.set([]);
      this.totalPosts.set(0);
    }
  }

  protected async onPostsPageChange(page: number): Promise<void> {
    this.currentPage.set(page);
    await this.loadPosts();
  }
}
