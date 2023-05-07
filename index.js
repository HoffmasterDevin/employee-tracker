// List of dependencies
const inquirer = require('inquirer');
const mysql = require('mysql2');
const consoleTable = require('console.table');
const util = require('util');
require('dotenv').config();

// Create connetion to MySQL
let connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: process.env.PASSWORD,
    database: 'employee_db'
});

connection.query = util.promisify(connection.query);

// Initialize the application after establishing connection
connection.connect(function (err) {
    if (err) throw (err);
    firstAction();
});

// Display welcome message in the console
console.table(
    '\n====== EMPLOYEE TRACKER =======\n'
)

// Initial question to determine which action to do first
const firstAction = async () => {
    try {
        let answer = await inquirer.prompt({
            name: 'action',
            type: 'list',
            message: 'What would you like to do?',
            choices: [
                'View Employees',
                'View Departments',
                'View Roles',
                'Add Employees',
                'Add Departments',
                'Add Roles',
                'Update Employee Role',
                'Exit'
            ]
        });
        switch (answer.action) {
            case 'View Employees':
                viewEmployee();
                break

            case 'View Departments':
                viewDepartment();
                break

            case 'View Roles':
                viewRole();
                break

            case 'Add Employees':
                addEmployee();
                break

            case 'Add Departments':
                addDepartment();
                break

            case 'Add Roles':
                addRole();
                break

            case 'Update Employee Role':
                updateEmployee();
                break

            case 'Exit':
                connection.end();
                break;
        };
    } catch (err) {
        console.log(err);
        firstAction();
    };
}

// View all employees
const viewEmployee = async () => {
    try {
        console.log('View Employee');

        let query = 'SELECT * FROM employee';
        connection.query(query, function (err, res) {
            if (err) throw err;
            let employeeArray = [];
            res.forEach(employee => employeeArray.push(employee));
            console.table(employeeArray);
            firstAction();
        });
    } catch (err) {
        console.log(err);
        firstAction();
    };
}
// View all departments
const viewDepartment = async () => {
    console.log('View Department');
    try {
        let query = 'SELECT * FROM department';
        connection.query(query, function (err, res) {
            if (err) throw err;
            let departmentArray = [];
            res.forEach(department => departmentArray.push(department)); //check
            console.table(departmentArray);
            firstAction();
        });
    } catch (err) {
        console.log(err);
        firstAction();
    };
}

// View all roles
const viewRole = async () => {
    console.log('Role View');
    try {
        let query = 'SELECT * FROM employee_role';
        connection.query(query, function (err, res) {
            if (err) throw err;
            let roleArray = [];
            res.forEach(role => roleArray.push(role));
            console.table(roleArray);
            firstAction();
        });
    } catch (err) {
        console.log(err);
        firstAction();
    };
}

// Add a new employee
const addEmployee = async () => {
    try {
        console.log('Add Employee');
        let roles = await connection.query('SELECT * FROM employee_role');

        let managers = await connection.query('SELECT * FROM employee');

        let answer = await inquirer.prompt([
            {
                name: 'firstName',
                type: 'input',
                message: "What is the employee's first name?"
            },
            {
                name: 'lastName',
                type: 'input',
                message: "What is the employee's last name?"
            },
            {
                name: 'employeeRoleId',
                type: 'list',
                choices: roles.map((role) => {
                    return {
                        name: role.title,
                        value: role.id
                    }
                }),
                message: "What is the role id of this employee?"
            },
            {
                name: 'employeeManagerId',
                type: 'list',
                choices: managers.map((manager) => {
                    return {
                        name: manager.first_name + ' ' + manager.last_name,
                        value: manager.id
                    }
                }),
                message: "What is the employee's manager id?"
            }
        ])

        let result = await connection.query('INSERT INTO employee SET ?', {
            first_name: answer.firstName,
            last_name: answer.lastName,
            role_id: (answer.employeeRoleId),
            manager_id: (answer.employeeManagerId)
        });
        
        console.log(`${answer.firstName} ${answer.lastName} added successfully.\n`);
        firstAction();
    } catch (err) {
        console.log(err);
        firstAction();
    };
}

// Add a new department
const addDepartment = async () => {
    try {
        console.log('Add Department');
        
        let answer = await inquirer.prompt([
            {
                name: 'departmentName',
                type: 'input',
                message: 'What is the name of the new department?'
            }
        ]);

        let result = connection.query('INSERT INTO department SET ?', {
            department_name: answer.departmentName
        });
        console.log(`${answer.departmentName} successfully added to departments.\n`)
        firstAction();
    } catch (err) {
        console.log(err);
        firstAction();
    }
}

// Add a new role
const addRole = async () => {
    try {
        console.log('Add Role');

        let departments = await connection.query('SELECT * FROM department')
        
        let answer = await inquirer.prompt([
            {
                name: 'title',
                type: 'input',
                message: 'What is the name of the new role?'
            },
            {
                name: 'salary',
                type: 'input',
                message: 'What is the salary for this new role?'
            },
            {
                name: 'departmentId',
                type: 'list',
                choices: departments.map((departmentId) => {
                    return {
                        name: departmentId.department_name,
                        value: departmentId.id
                    }
                }),
                message: 'What department ID is this role associated with?',
            }
        ]);
        
        let chosenDepartment;
        for (i = 0; i < departments.length; i++) {
            if (departments[i].department_id === answer.choice) {
                chosenDepartment = departments[i];
            };
        }

        let result = await connection.query('INSERT INTO employee_role SET ?', {
            title: answer.title,
            salary: answer.salary,
            department_id: answer.departmentId
        })

        console.log(`${answer.title} role added successfully.\n`)
        firstAction();
    } catch (err) {
        console.log(err);
        firstAction();
    };
}

// Update role for specific employee
const updateEmployee = async () => {
    try {
        console.log('Update employee');

        let employees = await connection.query('SELECT * FROM employee');

        let selectEmployee = await inquirer.prompt([
            {
                name: 'employee',
                type: 'list',
                choices: employees.map((employeeName) => {
                    return {
                        name: employeeName.first_name + ' ' + employeeName.last_name,
                        value: employeeName.id
                    }
                }),
                message: 'Please choose an employee to update.'
            }
        ]);

        let roles = await connection.query('SELECT * FROM employee_role');

        let selectRole = await inquirer.prompt([
            {
                name: 'role',
                type: 'list',
                choices: roles.map((roleName) => {
                    return {
                        name: roleName.title,
                        value: roleName.id
                    }
                }),
                message: 'Please select the role to update.'
            }
        ]);
        
        let result = connection.query('UPDATE employee SET ? WHERE ?', [{ role_id: selectRole.role}, { id: selectEmployee.employee }]);
        console.log('Role successfully updated.\n');
        firstAction();
    } catch (err) {
        console.log(err);
        firstAction();
    }
}