import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize'

import sequelize from '../../database/connection.js'

class Comentario extends Model<
  InferAttributes<Comentario>,
  InferCreationAttributes<Comentario>
> {
  declare id_comentario:
    CreationOptional<number>

  declare id_publicacion: number
  declare id_usuario: number
  declare contenido: string

  declare fecha_comentario:
    CreationOptional<Date>
}

Comentario.init(
  {
    id_comentario: {
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

    contenido: {
      type: DataTypes.STRING(1000),
      allowNull: false,
    },

    fecha_comentario: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'Comentario',
    tableName: 'Comentarios',
    timestamps: false,
  },
)

export default Comentario