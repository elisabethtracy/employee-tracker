import inquirer from 'inquirer';
import { QueryResult } from 'pg';
import { pool, connectToDb } from './connection.js';

async function startApp() {
    await connectToDb();
    mainMenu();
}
startApp();

// const PORT = process.env.PORT || 3001;
// const app = express();

// // Express middleware
// app.use(express.urlencoded({ extended: false }));
// app.use(express.json());

// app.use((_req, res) => {
//   res.status(404).end();
// });

// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

function mainMenu(): void {
inquirer.prompt([
    {
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
            'View all departments',
            'View all roles',
            'View all employees',
            'Add a department',
            'Add a role',
            'Add an employee',
            'Update an employee role',
            'Quit'
        ]
    }
])
.then((answers: { action: string }) => {
    switch (answers.action) {
        case 'View all departments':
            viewDepartments();
            break;
        case 'View all roles':
            viewRoles();
            break;
        case 'View all employees':
            viewEmployees();
            break;
        case 'Add a department':
            addDepartment();
            break;
        case 'Add a role':
            addRole();
            break;
        case 'Add an employee':
            addEmployee();
            break;
        case 'Update an employee role':
            updateEmployeeRole();
            break;
        case 'Quit':
            console.log('Exited!');
            process.exit();
    }
});
};

function viewDepartments(): void {
    console.log('Viewing departments:');
    pool.query('SELECT * FROM department', (err: Error, result: QueryResult) => {
        if (err) {
            console.error('Error fetching departments.', err);
        } else if (result) {
            console.table(result.rows)
        }
        mainMenu();
    });
};

function viewRoles(): void {
    console.log('Viewing roles:');
    pool.query('SELECT role.title, role.salary, role.id, department.name AS department_name FROM role LEFT JOIN department ON role.department_id = department.id', (err: Error, result: QueryResult) => {
        if (err) {
            console.error('Error fetching roles.', err);
        } else {
            console.table(result.rows);
        }
        mainMenu();
    });
};

function viewEmployees(): void {
    console.log('Viewing employees:');
    pool.query('SELECT e.id, e.first_name, e.last_name, r.title, d.department_name, r.salary, CONCAT(m.first_name, ' ', m.last_name) AS manager_name FROM employee e LEFT JOIN roles r ON e.role_id = r.id LEFT JOIN departments d ON r.department_id = d.id LEFT JOIN employee m ON e.manager_id = m.id', (err: Error, result: QueryResult) => {
        if (err) {
            console.error('Error fetching employees.', err);
        } else {
            console.table(result.rows);
        }
        mainMenu();
});
};

function addDepartment(): void {
    console.log('Adding a department:');
    inquirer.prompt([
        {
        type: 'input',
        name: 'departmentName',
        message: 'What is the name of the department?'
    }
])
    .then(answers => {
        pool.query('INSERT INTO department (name) VALUES ($1)', [answers.departmentName], (err: Error, result: QueryResult) => {
            if (err) {
                console.error('Error adding department.', err);
            } else {
                console.log('Department added successfully!', result.rows);
            }
            mainMenu();
    });
    });
};

function addRole(): void {
    inquirer.prompt([
        {
            type: 'input',
            name: 'roleTitle',
            message: 'Please enter the title of the role:'
        },
        {
            type: 'input',
            name: 'salary',
            message: 'Please enter the salary for the role.'
        }, 
        {
            type: 'list',
            name: 'action',
            message: 'Which department does the role belong to?',
            choices: ['SELECT * FROM department']
        }
    ]).then(answers => {
        pool.query('INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3)', [answers.roleTitle, answers.salary, answers.department_id], (err) => {
            if (err) {
                console.error('Error adding role.', err);
            } else {
                console.log('Role added successfully!');
            }
            mainMenu();
        });
    });
};

function addEmployee(): void {
    // pool.query('SELECT id, CONCAT(first_name, " ", last_name) AS name FROM employee', (error, results) => {
    //     if (error) {
    //         console.error(error);
    //         return;
    //     }
    //     const managers = results.map(({ id, name }) => ({
    //         name, 
    //         value: id,
    //     }));
    // })
    inquirer.prompt([
        {
            type: 'input',
            name: 'firstName',
            message: 'Please enter the first name of the employee:'
        },
        {
            type: 'input',
            name: 'lastName',
            message: 'Please enter the last name of the employee.'
        },
        {
            type: 'list',
            name: 'role',
            message: 'What is the employees role?',
            choices: ['SELECT title FROM role']
        },
        {
            type: 'list',
            name: 'manager',
            message: 'Who is the employees manager?',
            choices: [
                'SELECT manager_id AS'
            ]
        }
    ]).then(answers => {
        pool.query('INSERT INTO employee (first_name, last_name, role_id) VALUES ($1, $2, $3)', [answers.firstName, answers.lastName, answers.roleId], (err) => {
            if (err) {
                console.error('Error adding employee.', err);
            } else {
                console.log('Employee added successfully!');
            }
            mainMenu();
        });
    });
}

function updateEmployeeRole(): void {
    inquirer.prompt([
        {
            type: 'input',
            name: 'employeeId',
            message: 'Please enter the ID of the employee to update:'
        },
        {
            type: 'input',
            name: 'newRoleId',
            message: 'Please enter the new role ID.'
        }
    ]).then(answers => {
        pool.query('UPDATE employee SET role_id = $1 WHERE id = $2', [answers.newRoleId, answers.employeeId], (err) => {
            if (err) {
                console.error('Error updating employee role.', err);
            } else {
                console.log('Employee role updated successfully!');
            }
            mainMenu();
        });
    });
}

