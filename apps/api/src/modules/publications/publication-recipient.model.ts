import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize'

import sequelize from '../../database/connection.js'

class PublicacionDestinatario extends Model<
  InferAttributes<PublicacionDestinatario>,
  InferCreationAttributes<PublicacionDestinatario>
> {
  declare id_publicacion: number
  declare id_usuario: number

  declare fecha_asignacion:
    CreationOptional<Date>
}

PublicacionDestinatario.init(
  {
    id_publicacion: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },

    id_usuario: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },

    fecha_asignacion: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'PublicacionDestinatario',
    tableName: 'Publicacion_Destinatarios',
    timestamps: false,
  },
)

export default PublicacionDestinatario