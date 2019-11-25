'use strict';
<%&fileHeader%>


/**
 * Exporting the model
 * @param {object} sequelize
 * @param {object} DataTypes
 * @return {object}
 */
module.exports = (sequelize,DataTypes) => {
  return sequelize.define('<%moduleModelName%>',{
    <%#moduleFields%>
    <%fieldName%>: {
      type: DataTypes.<%fieldType%>,
      allowNull: <%fieldAllowNull%>,
      <%#fieldDefaultValue%>
        defaultValue: <%fieldDefaultValue%>
      <%/fieldDefaultValue%>
    },
    <%/moduleFields%>
  })
}
