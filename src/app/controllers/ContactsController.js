import * as Yup from "yup";
import { Op } from "sequelize";
import { parseISO } from "date-fns";

// import Customer from "../models/Customer";
import Contact from "../models/Contact";

class ContactsController {
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

    let where = { customer_id: req.params.customerId };
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
    const data = await Contact.findAll({
      where,
      attributes: { exclude: ["customerId", "customer_id"] },
      order,
      limit,
      offset: limit * page - limit,
    });
    return res.json(data);
  }

  // Recupera um único Customer
  async show(req, res) {
    const contact = await Contact.findOne({
      where: {
        customer_id: req.params.customerId,
        id: req.params.id,
      },
      attributes: { exclude: ["customerId", "customer_id"] },
    });

    if (!contact) {
      return res.status(404).json();
    }

    return res.json(contact);
  }

  async create(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string().email().required(),
      status: Yup.string().uppercase(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: "Error on validate schema." });
    }

    const verifyEmail = await Contact.findOne({
      where: {
        email: req.body.email,
      },
    });

    if (verifyEmail) {
      return res.status(400).json({ error: "Email already in use" });
    }

    const contact = await Contact.create({
      customer_id: req.params.customerId,
      ...req.body,
    });
    return res.status(201).json(contact);
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

    const contact = await Contact.findOne({
      where: {
        customer_id: req.params.customerId,
        id: req.params.id,
      },
      attributes: { exclude: ["customerId", "customer_id"] },
    });

    if (!contact) {
      return res.status(404).json();
    }

    await contact.update(req.body);
    return res.json(contact);
  }

  // Deleta um Customer
  async destroy(req, res) {
    const contact = await Contact.findOne({
      where: {
        customer_id: req.params.customerId,
        id: req.params.id,
      },
    });

    if (!contact) {
      return res.status(404).json();
    }

    await contact.destroy();

    return res.json();
  }
}
export default new ContactsController();
