export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  createdAt: Date;
  salary: number;
}

export const dummyUsers: User[] = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'Developer',
    status: 'active',
    createdAt: new Date('2023-01-15'),
    salary: 75000
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    role: 'Designer',
    status: 'active',
    createdAt: new Date('2023-02-20'),
    salary: 68000
  },
  {
    id: 3,
    name: 'Bob Johnson',
    email: 'bob.johnson@example.com',
    role: 'Manager',
    status: 'active',
    createdAt: new Date('2022-11-10'),
    salary: 95000
  },
  {
    id: 4,
    name: 'Alice Williams',
    email: 'alice.williams@example.com',
    role: 'Developer',
    status: 'inactive',
    createdAt: new Date('2023-03-05'),
    salary: 72000
  },
  {
    id: 5,
    name: 'Charlie Brown',
    email: 'charlie.brown@example.com',
    role: 'QA Engineer',
    status: 'active',
    createdAt: new Date('2023-04-12'),
    salary: 65000
  },
  {
    id: 6,
    name: 'Diana Prince',
    email: 'diana.prince@example.com',
    role: 'Product Manager',
    status: 'active',
    createdAt: new Date('2022-09-18'),
    salary: 88000
  },
  {
    id: 7,
    name: 'Eve Adams',
    email: 'eve.adams@example.com',
    role: 'Developer',
    status: 'active',
    createdAt: new Date('2023-05-22'),
    salary: 78000
  },
  {
    id: 8,
    name: 'Frank Miller',
    email: 'frank.miller@example.com',
    role: 'DevOps Engineer',
    status: 'inactive',
    createdAt: new Date('2023-01-08'),
    salary: 82000
  }
];

