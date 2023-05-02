INSERT INTO department (department_name)
VALUES 
  ('Management'),
  ('Deli'),
  ('Bakery');

INSERT INTO role (title, salary, department_id)
VALUES 
  ('General Manager', 100000, 1),
  ('Assistant Manager', 50000, 1),
  ('Deli Lead', 30000, 2),
  ('Cashier', 20000, 2),
  ('Head Baker', 40000, 3),
  ('Baker', 25000, 3);
  
INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES 
  ('Tim', 'Foster', 1, NULL),
  ('Jacob', 'Jingleheimer', 2, 1),
  ('Ross', 'Gerhart', 3, 2),
  ('Steven', 'Rossi', 4, 3),
  ('Albert', 'Klemmens', 5, 2),
  ('Micheal', 'Hartman', 6, 5)