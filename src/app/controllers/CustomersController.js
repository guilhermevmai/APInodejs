const customers = [
  { id: 1, name: "Guilherme", age: 17 },
  { id: 2, name: "Alysson", age: 19 },
  { id: 3, name: "Camila", age: 15 },
];
class CustomersController {
  // Listagem dos Customers
  index(req, res) {
    return res.json(customers);
  }

  // Recupera um único Customer
  show(req, res) {
    const id = parseInt(req.params.id, 10);
    const customer = customers.find((item) => item.id === id);
    const status = customer ? 200 : 404;

    console.log("GET :: /customers/:id ", customer);
    return res.status(status).json(customer);
  }

  // Cria um novo Customer
  create(req, res) {
    const { name } = req.body;
    const age = parseInt(req.body.age, 10);
    const id = customers[customers.length - 1].id + 1;

    const newCustomer = { id, name, age };
    customers.push(newCustomer);

    return res.status(201).json(newCustomer);
  }

  // Atualiza um Customer
  update(req, res) {
    const id = parseInt(req.params.id, 10);
    const { name } = req.body;
    const age = parseInt(req.body.age, 10);

    const index = customers.findIndex((item) => item.id === id);
    const status = index >= 0 ? 200 : 404;
    if (index >= 0) {
      customers[index] = { id: parseInt(id, 10), name, age };
    }

    return res.status(status).json(customers[index]);
  }

  // Deleta um Customer
  destroy(req, res) {
    const id = parseInt(req.params.id, 10);
    const index = customers.findIndex((item) => item.id === id);
    const status = index >= 0 ? 200 : 404;
    if (index >= 0) {
      customers.splice(index, 1);
    }
    return res.status(status).json();
  }
}

export default new CustomersController();
