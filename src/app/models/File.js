/* eslint-disable no-param-reassign */
import Sequelize, { Model } from "sequelize";

class File extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
        path: Sequelize.STRING,
      },
      {
        sequelize,
        name: {
          singular: "file",
          plural: "files",
        },
      }

      // hooks: {
      //   beforeValidate: (customer, options) => {
      //     customer.status = "ARCHIVED";
      //   },
      // },
    );
  }

  static associate(models) {
    this.hasMany(models.Contact);
  }
}

export default File;
