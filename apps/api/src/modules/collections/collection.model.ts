import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize'

import sequelize from '../../database/connection.js'

class Coleccion extends Model<
  InferAttributes<Coleccion>,
  InferCreationAttributes<Coleccion>
> {
  declare id_coleccion: CreationOptional<number>
  declare id_usuario: number
  declare nombre: string
  declare descripcion: string | null
  declare fecha_creacion: CreationOptional<Date | null>
}

Coleccion.init(
  {
    id_coleccion: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    id_usuario: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    nombre: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },

    descripcion: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },

    fecha_creacion: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'Coleccion',
    tableName: 'Colecciones',
    timestamps: false,
  },
)

export default Coleccion