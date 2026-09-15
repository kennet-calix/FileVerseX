import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize'

import sequelize from '../../database/connection.js'

class Like extends Model<
  InferAttributes<Like>,
  InferCreationAttributes<Like>
> {
  declare id_like:
    CreationOptional<number>

  declare id_publicacion: number
  declare id_usuario: number

  declare fecha_like:
    CreationOptional<Date>
}

Like.init(
  {
    id_like: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    id_publicacion: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    id_usuario: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    fecha_like: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'Like',
    tableName: 'Likes',
    timestamps: false,

    indexes: [
      {
        unique: true,
        fields: [
          'id_publicacion',
          'id_usuario',
        ],
      },
    ],
  },
)

export default Like