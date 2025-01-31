import * as Yup from "yup";
import { Op } from "sequelize";
import { parseISO } from "date-fns";

import User from "../models/User";
// import Mail from "../../lib/Mailer";

import Queue from "../../lib/Queue";
import WelcomeEmailJob from "../jobs/WelcomeEmailJob";

class UsersController {
  async index(req, res) {
    const {
      name,
      email,
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
    const data = await User.findAll({
      where,
      attributes: { exclude: ["password", "password_hash"] },
      order,
      limit,
      offset: limit * page - limit,
    });

    console.log({ userId: req.userId });

    return res.json(data);
  }

  async show(req, res) {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ["password", "password_hash"] },
    });

    if (!user) {
      return res.status(404).json();
    }
    const { id, name, email, file_id, createdAt, updatedAt } = user;
    return res
      .status(200)
      .json({ id, name, email, file_id, createdAt, updatedAt });
  }

  async create(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string().email().required(),
      password: Yup.string().required().min(8),
      passwordConfirmation: Yup.string().when("password", (password, field) =>
        password ? field.required().oneOf([Yup.ref("password")]) : field
      ),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: "Error on validate schema." });
    }

    const verifyEmail = await User.findOne({
      where: {
        email: req.body.email,
      },
    });

    if (verifyEmail) {
      return res.status(401).json({ error: "Email already in use" });
    }

    const {
      id,
      name,
      email,
      file_id,
      createdAt,
      updatedAt,
    } = await User.create(req.body);

    await Queue.add(WelcomeEmailJob.key, { email, name });

    return res
      .status(201)
      .json({ id, name, email, file_id, createdAt, updatedAt });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      oldPassword: Yup.string().min(8),
      password: Yup.string()
        .min(8)
        .when("oldPassword", (oldPassword, field) =>
          oldPassword ? field.required() : field
        ),
      passwordConfirmation: Yup.string().when("password", (password, field) =>
        password ? field.required().oneOf([Yup.ref("password")]) : field
      ),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: "Error on validate schema." });
    }

    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json();
    }

    const newEmail = req.body.email;

    if (newEmail) {
      const verifyEmail = await User.findOne({
        where: {
          email: newEmail,
        },
      });
      if (verifyEmail) {
        return res.status(400).json({ error: "Email already in use" });
      }
    }
    const { oldPassword } = req.body;

    if (oldPassword && !(await user.checkPassword(oldPassword))) {
      return res.status(401).json({ error: "User password not match." });
    }

    const {
      id,
      name,
      email,
      file_id,
      createdAt,
      updatedAt,
    } = await user.update(req.body);
    return res
      .status(201)
      .json({ id, name, email, file_id, createdAt, updatedAt });
  }

  async destroy(req, res) {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json();
    }

    await user.destroy();

    return res.json();
  }
}
export default new UsersController();
