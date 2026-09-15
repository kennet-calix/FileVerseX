import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize'

import sequelize from '../../database/connection.js'

class HistorialPublicacion extends Model<
  InferAttributes<HistorialPublicacion>,
  InferCreationAttributes<HistorialPublicacion>
> {
  declare id_historial:
    CreationOptional<number>

  declare id_publicacion: number
  declare id_usuario: number

  declare alcance_anterior:
    | 'publica'
    | 'dirigida'
    | 'privada'
    | null

  declare alcance_nuevo:
    | 'publica'
    | 'dirigida'
    | 'privada'

  /*
   * Copia de los destinatarios que
   * tenía la publicación al momento
   * del cambio.
   *
   * Ejemplo:
   * [2, 4, 7]
   */
  declare destinatarios_snapshot:
    | number[]
    | null

  /*
   * Cantidad de likes acumulados
   * hasta el momento del cambio.
   */
  declare likes_acumulados:
    CreationOptional<number>

  /*
   * Cantidad de comentarios acumulados
   * hasta el momento del cambio.
   */
  declare comentarios_acumulados:
    CreationOptional<number>

  declare fecha_cambio:
    CreationOptional<Date>
}

HistorialPublicacion.init(
  {
    id_historial: {
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

    alcance_anterior: {
      type: DataTypes.ENUM(
        'publica',
        'dirigida',
        'privada',
      ),
      allowNull: true,
    },

    alcance_nuevo: {
      type: DataTypes.ENUM(
        'publica',
        'dirigida',
        'privada',
      ),
      allowNull: false,
    },

    destinatarios_snapshot: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: null,
    },

    likes_acumulados: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    comentarios_acumulados: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    fecha_cambio: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName:
      'HistorialPublicacion',

    tableName:
      'Historial_Publicaciones',

    timestamps: false,
  },
)

export default HistorialPublicacion