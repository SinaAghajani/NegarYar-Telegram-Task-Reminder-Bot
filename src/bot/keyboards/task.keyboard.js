const { Markup } = require("telegraf");

module.exports = {
  cancel() {
    return Markup.keyboard([["❌ لغو"]]).resize();
  },

  description() {
    return Markup.keyboard([["⏭ بدون توضیحات"], ["❌ لغو"]]).resize();
  },
};
