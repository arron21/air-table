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

// Generate large dataset for performance testing
export function generateLargeUserDataset(count: number): User[] {
  const firstNames = [
    'John', 'Jane', 'Bob', 'Alice', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Henry',
    'Isabel', 'Jack', 'Karen', 'Leo', 'Maria', 'Nathan', 'Olivia', 'Peter', 'Quinn', 'Rachel',
    'Sam', 'Tina', 'Uma', 'Victor', 'Wendy', 'Xavier', 'Yara', 'Zoe', 'Aaron', 'Beth',
    'Carl', 'Dana', 'Eric', 'Fiona', 'Gary', 'Helen', 'Ian', 'Julia', 'Kyle', 'Luna',
    'Mark', 'Nina', 'Oscar', 'Paula', 'Quentin', 'Rita', 'Steve', 'Tara', 'Ulrich', 'Vera'
  ];
  
  const lastNames = [
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
    'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
    'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
    'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
    'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts'
  ];
  
  const roles = [
    'Developer', 'Senior Developer', 'Lead Developer', 'Designer', 'UX Designer', 'UI Designer',
    'Manager', 'Product Manager', 'Project Manager', 'QA Engineer', 'DevOps Engineer', 'Data Scientist',
    'Business Analyst', 'Marketing Specialist', 'Sales Representative', 'HR Specialist', 'Finance Analyst',
    'Support Engineer', 'Technical Writer', 'Architect', 'Consultant', 'Intern', 'Director', 'VP'
  ];
  
  const domains = [
    'example.com', 'company.com', 'business.org', 'enterprise.net', 'tech.io', 'startup.co',
    'innovation.com', 'solutions.com', 'services.org', 'consulting.net'
  ];
  
  const users: User[] = [];
  
  for (let i = 1; i <= count; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const role = roles[Math.floor(Math.random() * roles.length)];
    const domain = domains[Math.floor(Math.random() * domains.length)];
    
    // Create email from name
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i > 1000 ? i : ''}@${domain}`;
    
    // Random date within last 3 years
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 3);
    const endDate = new Date();
    const randomDate = new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()));
    
    // Random salary based on role
    let baseSalary = 50000;
    if (role.includes('Senior') || role.includes('Lead')) baseSalary = 80000;
    if (role.includes('Manager') || role.includes('Director')) baseSalary = 90000;
    if (role.includes('VP')) baseSalary = 120000;
    if (role.includes('Architect')) baseSalary = 100000;
    if (role.includes('Intern')) baseSalary = 35000;
    
    const salary = baseSalary + Math.floor(Math.random() * 30000);
    
    users.push({
      id: i,
      name: `${firstName} ${lastName}`,
      email,
      role,
      status: Math.random() > 0.2 ? 'active' : 'inactive', // 80% active
      createdAt: randomDate,
      salary
    });
  }
  
  return users;
}

