import * as Yup from "yup";
import { Op } from "sequelize";
import { parseISO } from "date-fns";

import Customer from "../models/Customer";
import Contact from "../models/Contact";

class CustomersController {
  // Listagem dos Customers
  async index(req, res) {
    const {
      name,
      email,
      status,
      createdBefore,
      createdAfter,
      updateBefore,
      updateAfter,
      sort,
    } = req.query;

    const page = req.query.page || 1;
    const limit = req.query.limit || 25;

    let where = {};
    let order = [];
    if (name) {
      where = {
        ...where,
        name: {
          [Op.iLike]: name,
        },
      };
    }
    if (email) {
      where = {
        ...where,
        email: {
          [Op.Ilike]: email,
        },
      };
    }
    if (status) {
      where = {
        ...where,
        status: {
          [Op.in]: status.split(",").map((item) => item.toUpperCase()),
        },
      };
    }
    if (createdBefore) {
      where = {
        ...where,
        createdAt: {
          [Op.gte]: parseISO(createdBefore),
        },
      };
    }
    if (createdAfter) {
      where = {
        ...where,
        createdAt: {
          [Op.lte]: parseISO(createdAfter),
        },
      };
    }
    if (updateBefore) {
      where = {
        ...where,
        updateAt: {
          [Op.gte]: parseISO(updateBefore),
        },
      };
    }
    if (updateAfter) {
      where = {
        ...where,
        updateAt: {
          [Op.lte]: parseISO(updateAfter),
        },
      };
    }
    if (sort) {
      order = sort.split(",").map((item) => item.split(":"));
    }
    const data = await Customer.findAll({
      where,
      include: [
        {
          model: Contact,
          attributes: ["name", "status"],
        },
      ],
      order,
      limit,
      offset: limit * page - limit,
    });
    return res.json(data);
  }

  // Recupera um único Customer
  async show(req, res) {
    const customer = await Customer.findByPk(req.params.id);

    if (!customer) {
      return res.status(404).json();
    }

    return res.json(customer);
  }

  // Cria um novo Customer
  async create(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string().email().required(),
      status: Yup.string().uppercase(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: "Error on validate schema." });
    }

    const verifyEmail = await Customer.findOne({
      where: {
        email: req.body.email,
      },
    });

    if (verifyEmail) {
      return res.status(400).json({ error: "Email already in use" });
    }

    const customer = await Customer.create(req.body);
    return res.status(201).json(customer);
  }

  // Atualiza um Customer
  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      status: Yup.string().uppercase(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: "Error on validate schema." });
    }
    const newEmail = req.body.email;

    if (newEmail) {
      const verifyEmail = await Customer.findOne({
        where: {
          email: newEmail,
        },
      });
      if (verifyEmail) {
        return res.status(400).json({ error: "Email already in use" });
      }
    }
    const customer = await Customer.findByPk(req.params.id);

    if (!customer) {
      return res.status(404).json();
    }

    await customer.update(req.body);
    return res.json(customer);
  }

  // Deleta um Customer
  async destroy(req, res) {
    const customer = await Customer.findByPk(req.params.id);

    if (!customer) {
      return res.status(404).json();
    }

    await customer.destroy();

    return res.json();
  }
}

export default new CustomersController();
