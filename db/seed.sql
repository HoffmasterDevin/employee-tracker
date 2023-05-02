INSERT INTO department (departmentName)
VALUES 
  ('Management'),
  ('Deli'),
  ('Bakery');

INSERT INTO employeeRole (title, salary, departmentId)
VALUES 
  ('General Manager', 100000, 1),
  ('Assistant Manager', 50000, 1),
  ('Deli Lead', 30000, 2),
  ('Cashier', 20000, 2),
  ('Head Baker', 40000, 3),
  ('Baker', 25000, 3);
  
INSERT INTO employee (firstName, lastName, roleId, managerId)
VALUES 
  ('Tim', 'Foster', 1, NULL),
  ('Jacob', 'Jingleheimer', 2, 1),
  ('Ross', 'Gerhart', 3, 2),
  ('Steven', 'Rossi', 4, 3),
  ('Albert', 'Klemmens', 5, 2),
  ('Micheal', 'Hartman', 6, 5)