const inquirer = require('inquirer');
const cTable = require("console.table");
const mysql = require('mysql2');
const util = require('util');
require('dotenv').config();

let connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: process.env.PASSWORD,
    database: 'employee_db'
});

connection.query = util.promisify(connection.query);

connection.connect(function (err) {
    if (err) throw (err);
    firstAction();
});


// Inquirer Questions
const QuestionMenu = [
  {
    type:"list",
    name:"nextAction",
    message:"What would you like to do? ",
    choices: [
      "View All Employees",
      "View All Roles",
      "View All Departments",
      "Add Employee",
      "Add Role",
      "Add Department",
      "Update Employee Role",
      "Quit"
    ],
  },
]

const addDepQuestion = [
  {
    type:"input",
    name:"name",
    message:"What department do you want to add? ",
  },
];

const addRoleQuestions = [
  {
    type:"input",
    name:"title",
    message:"What is the role? ",
  },
  {
    type:"number",
    name:"salary",
    message:"What is the salary of the role? ",
  },
  {
    type:"list",
    name:"departmentId",
    message:"Which department does this role belong to? ",
    choices: [],
  },
]

const addEmployeeQuestions = [
  {
    type:"input",
    name:"firstName",
    message:"What is the employee's first name? ",
  },
  {
    type:"input",
    name:"lastName",
    message:"What is their last name? ",
  },
  {
    type:"list",
    name:"roleId",
    message:"What is their role? ",
    choices: [],
  },
  {
    type:"list",
    name:"managerId",
    message:"Who is their manager? ",
    choices: [],
  },
]

const updateEmployeeQuestions = [
  {
    type:"list",
    name:"employeeId",
    message:"Which employee would you like to update? ",
    choices: [],
  },
  {
    type:"list",
    name:"roleId",
    message:"Which role should they be changed to? ",
    choices: [],
  },
]

class Prompter {
  // Displays a menu for user input
  showMenu() {
    inquirer
      .prompt(QuestionMenu)
      .then(data => {
        let nextAction = data["nextAction"];
        if (nextAction == "View All Employees") {
          this.displayEmployees();
        } else if (nextAction == "Add Employee") {
          this.addEmployee();
        } else if (nextAction == "Update Employee Role") {
          this.updateEmployeeRole();
        } else if (nextAction == "View All Roles") {
          this.displayRoles();
        } else if (nextAction == "Add Role") {
          this.addRole();
        } else if (nextAction == "View All Departments") {
          this.displayDepartments();
        } else if (nextAction == "Add Department") {
          this.addDepartment();
        } else if (nextAction == "Quit") {
          console.log('Disconnecting database.');
          db.end();
          console.log('Quitting the application.');
          process.exit();
        }
      })
  }

  // Add a department
  addDepartment() {
    inquirer
      .prompt(addDepQuestion)
      .then(data => {
        db.query(`INSERT INTO department (name) VALUES (?)`, data.name);
        console.log(`Added ${data.name} to departments.\n`);
        this.showMenu();
      });
  }

  // Add a role
  addRole() {
    addRoleQuestions[2].choices = [];

    db.query('SELECT * FROM department', (err, departments) => {
      if (departments == false) { 
        console.log('Add at least one department before adding a role.\n');
        this.showMenu();
      } else { 
        for (let department of departments) {
          addRoleQuestions[2].choices.push(`${department.id} - ${department.name}`);
        }

        inquirer
        .prompt(addRoleQuestions)
        .then(data => {

          data.departmentId = parseInt(data.departmentId.split(' ')[0]);

          const sql = `INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)`;
          const params = [data.title, data.salary, data.departmentId];
          db.query(sql, params , (err, result) => {
            if (err) {
              console.log(`Error: ${err.sqlMessage}`);
              console.log(`${data.title} was not added to roles\n`)
            } else {
              console.log(`Added ${data.title} to roles.\n`);
            }
            this.showMenu();
          });
        })
      }
    });     
  }

  // Add an employee
  addEmployee() {
    addEmployeeQuestions[2].choices = [];
    addEmployeeQuestions[3].choices = ['No manager'];

    db.query('SELECT id, title FROM role', (err, roles) => {
      if (roles == false) { 
        console.log('Add at least one role before adding an employee.\n');
        this.showMenu();
      } else { 
        for (let role of roles) {
          addEmployeeQuestions[2].choices.push(`${role.id} - ${role.title}`);
        }

        db.query('SELECT * FROM employee', (err, employees) => {
          for (let employee of employees) {
            addEmployeeQuestions[3].choices.push(`${employee.id} - ${employee.first_name} ${employee.last_name}`);
          }

          inquirer
          .prompt(addEmployeeQuestions)
          .then(data => {
            // Grab ids from result and convert to ints
            data.roleId = parseInt(data.roleId.split(' ')[0]);
            if (data.managerId == 'No manager') {
              data.managerId = null;
            } else {
              data.managerId = parseInt(data.managerId.split(' ')[0]);
            }

            // Insert data into employee table
            const sql = `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)`;
            const params = [data.firstName, data.lastName, data.roleId, data.managerId];
            db.query(sql, params , (err, result) => {
              console.log(`Added ${data.firstName} ${data.lastName} to employees.\n`);
              this.showMenu();
            });
          });
        });
      }
    });
  }

  // Update an employee role
  updateEmployeeRole() {
    updateEmployeeQuestions[0].choices = [];
    updateEmployeeQuestions[1].choices = [];

    db.query('SELECT * FROM employee', (err, employees) => {
      for (let employee of employees) {
        updateEmployeeQuestions[0].choices.push(`${employee.id} - ${employee.first_name} ${employee.last_name}`);
      }

      db.query('SELECT * FROM role', (err, roles) => {
        for (let role of roles) {
          updateEmployeeQuestions[1].choices.push(`${role.id} - ${role.title}`);
        }

        inquirer
        .prompt(updateEmployeeQuestions)
        .then(data => {
          data.employeeId = parseInt(data.employeeId.split(' ')[0]);
          data.roleId = parseInt(data.roleId.split(' ')[0]);

          const sql = `UPDATE employee SET role_id = ? WHERE id = ?`;
          const params = [data.roleId, data.employeeId];
          db.query(sql, params , (err, result) => {
            console.log(`Updated the role for the employee.\n`);
            this.showMenu();
          });
        });
      });
    });
  }

  // Displays the departments
  displayDepartments() {
    const sql = `SELECT * FROM department`;
    db.query(sql, (err, result) => {
      if (result == false) {
        console.log('Department not found.\n');
      } else {
        console.table(result);
      }
      this.showMenu();
    });
  }

  // Displays the roles
  displayRoles() {
    const sql = `SELECT role.id, role.title, department.name AS department, role.salary 
                 FROM role 
                 INNER JOIN department On role.department_id = department.id`;
    db.query(sql, (err, result) => {
      if (result == false) {
        console.log('Role not found.\n');
      } else {
        console.table(result);
      }
      this.showMenu();
    });
  }

  // Displays the employees
  displayEmployees() {
    const sql = `SELECT 
                  e1.id, 
                  e1.first_name, 
                  e1.last_name, 
                  r.title, 
                  d.name AS department, 
                  r.salary, 
                  CONCAT(e2.first_name, ' ', e2.last_name) AS manager
                 FROM employee e1
                 LEFT JOIN employee e2 ON e1.manager_id = e2.id
                 INNER JOIN role AS r ON e1.role_id = r.id
                 INNER JOIN department AS d ON r.department_id = d.id`;
    db.query(sql, (err, result) => {
      if (result == false) {
        console.log('Employee not found.\n');
      } else {
        console.table(result);
      }
      this.showMenu();
    });
  }
}

const prompter = new Prompter();

// Start the application
prompter.showMenu();