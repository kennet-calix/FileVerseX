import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize'

import sequelize from '../../database/connection.js'

class Usuario extends Model<
  InferAttributes<Usuario>,
  InferCreationAttributes<Usuario>
> {
  declare id_usuario: CreationOptional<number>
  declare id_rol: CreationOptional<number>
  declare nombre_completo: string
  declare email: string
  declare password_hash: string
  declare descripcion: string | null
  declare foto_perfil: CreationOptional<string | null>
  declare esta_bloqueado: CreationOptional<boolean | null>
  declare fecha_registro: CreationOptional<Date | null>
}

Usuario.init(
  {
    id_usuario: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    id_rol: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 2,
    },

    nombre_completo: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },

    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
    },

    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },

    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    foto_perfil: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: 'default_profile.png',
    },

    esta_bloqueado: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },

    fecha_registro: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'Usuario',
    tableName: 'Usuarios',
    timestamps: false,
  },
)

export default Usuario