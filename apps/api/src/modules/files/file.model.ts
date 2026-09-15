import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize'

import sequelize from '../../database/connection.js'

class Archivo extends Model<
  InferAttributes<Archivo>,
  InferCreationAttributes<Archivo>
> {
  declare id_archivo: CreationOptional<number>
  declare id_usuario: number
  declare nombre_original: string
  declare ruta_almacenamiento: string
  declare tipo_mime: string
  declare tamano_bytes: number
  declare contador_descargas: CreationOptional<number | null>
  declare estado: CreationOptional<'activo' | 'restringido'>
  declare fecha_subida: CreationOptional<Date | null>
}

Archivo.init(
  {
    id_archivo: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    id_usuario: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    nombre_original: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },

    ruta_almacenamiento: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },

    tipo_mime: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    tamano_bytes: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },

    contador_descargas: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },

    estado: {
      type: DataTypes.ENUM('activo', 'restringido'),
      allowNull: false,
      defaultValue: 'activo',
    },

    fecha_subida: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'Archivo',
    tableName: 'Archivos',
    timestamps: false,
  },
)

export default Archivo