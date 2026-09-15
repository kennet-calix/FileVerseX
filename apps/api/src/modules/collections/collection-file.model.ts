import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize'

import sequelize from '../../database/connection.js'

class ColeccionArchivo extends Model<
  InferAttributes<ColeccionArchivo>,
  InferCreationAttributes<ColeccionArchivo>
> {
  declare id_coleccion: number
  declare id_archivo: number
  declare fecha_agregado: CreationOptional<Date | null>
}

ColeccionArchivo.init(
  {
    id_coleccion: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },

    id_archivo: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },

    fecha_agregado: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'ColeccionArchivo',
    tableName: 'Coleccion_Archivos',
    timestamps: false,
  },
)

export default ColeccionArchivo