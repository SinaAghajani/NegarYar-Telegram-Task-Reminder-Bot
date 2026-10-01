module.exports = async (ctx) => {
  if (ctx.scene?.current) {
    await ctx.scene.leave();
  }

  await ctx.reply("❌ عملیات لغو شد.");
};
