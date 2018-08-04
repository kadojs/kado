'use strict';


/**
 * Exporting the model
 * @param {object} sequelize
 * @param {object} DataTypes
 * @return {object}
 */
module.exports = function(sequelize,DataTypes) {
  return sequelize.define('{{moduleModelName}}',{
    {{#moduleFields}}
    {{fieldName}}: {
      type: {{fieldType}},
      allowNull: {{fieldAllowNull}},
      defaultValue: {{fieldDefaultValue}}
    },
    {{/moduleFields}}
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  })
}
