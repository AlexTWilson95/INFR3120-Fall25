router.post("/deposit", async (req, res) => {
  const amount = Number(req.body.amount);
  const user = await User.findById(req.session.userId);

  user.wallet += amount;
  await user.save();

  res.redirect("/feature");
});
