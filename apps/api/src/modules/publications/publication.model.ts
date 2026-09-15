import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize'

import sequelize from '../../database/connection.js'

class Publicacion extends Model<
  InferAttributes<Publicacion>,
  InferCreationAttributes<Publicacion>
> {
  declare id_publicacion: CreationOptional<number>
  declare id_usuario: number

  declare tipo_contenido:
    | 'archivo'
    | 'coleccion'

  declare id_archivo:
    | number
    | null

  declare id_coleccion:
    | number
    | null

  declare alcance:
    | 'publica'
    | 'dirigida'
    | 'privada'

  declare esta_activa:
    CreationOptional<boolean>

  declare fecha_publicacion:
    CreationOptional<Date>

  declare fecha_actualizacion:
    CreationOptional<Date>
}

Publicacion.init(
  {
    id_publicacion: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    id_usuario: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    tipo_contenido: {
      type: DataTypes.ENUM(
        'archivo',
        'coleccion',
      ),
      allowNull: false,
    },

    id_archivo: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    id_coleccion: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    alcance: {
      type: DataTypes.ENUM(
        'publica',
        'dirigida',
        'privada',
      ),
      allowNull: false,
      defaultValue: 'privada',
    },

    esta_activa: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },

    fecha_publicacion: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },

    fecha_actualizacion: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'Publicacion',
    tableName: 'Publicaciones',
    timestamps: false,
  },
)

export default Publicacion