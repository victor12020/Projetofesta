const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
router.post("/register", async (req, res) => {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  const confirmpassword = req.body.confirmpassword; 
  //testando todos campos
  if (
    name == null ||
    email == null ||
    password == null ||
    confirmpassword == null
  ) {
    return res
      .status(400)
      .json({ error: "Pro favor preenchar todos os campos" });
  } 
  //testando senha
  if (password != confirmpassword) {
    return res.status(400).json({ error: "As senhas não conferem!!!" });
  } 
  //testando se o usuario já existe
  const emailExists = await User.findOne({ email: email });
  if (emailExists) {
    return res.status(400).json({ error: "O e-mail informado já existe!!!" });
  } 
  //criando o hash de senha
  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt); 
  //criando o usuario
  const user = new User({ name: name, email: email, password: passwordHash });
  try {
    const newUser = await user.save(); 
    //criando o token
    const token = jwt.sign({ name: newUser.name, id: newUser._id }, "segredo");
    //retornando toke
    res.json({
      error: null,
      msg: "Você fez o cadastro com sucesso",
      token: token,
      userId: newUser._id,
    });
  } catch (error) {
    res.status(400).json({ error });
  }
}); 
//criando rota de login
router.post("/login", async (req, res) => {
  const email = req.body.email;
  const password = req.body.email; //usuario existe
  const user = await User.findOne({ email: email });
  if (!user) {
    return res
      .status(400)
      .json({ error: "Email não cadastrao, usuario inexistente" });
  } 
  //testando a senha
  const checckPassword = await bcrypt.compare(password, user.password);
  if (!checkPassword) {
    return res.status(400).json({ error: "Senha  inválida!!!" });
  } 
  //usuario cadastrado, gerando token
  const token = jwt.sign({ name: user.name, id: user._id }, "segredo");
  res.json({
    error: null,
    msg: "Você está logado no site",
    token: token,
    userId: user._id,
  });
});
module.exports = router;
