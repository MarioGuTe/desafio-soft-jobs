const express = require("express");
const app = express();
const cors = require("cors");
const jwt = require("jsonwebtoken");
const {
  getUsuarios,
  agregarUsuario,
  verificarCredenciales,
} = require("./consultas");

app.use(cors());
app.use(express.json());

const reportarConsulta = async (req, res, next) => {
  const parametros = req.params;
  const url = req.url;
  console.log(
    `
  Hoy ${new Date()}
  Se ha recibido una consulta en la ruta ${url}`
  );
  next();
};

app.get("/usuarios", reportarConsulta, async (req, res) => {
  try {
    const Authorization = req.header("Authorization");
    const token = Authorization.split("Bearer ")[1];

    jwt.verify(token, "az_AZ");
    const { email } = jwt.decode(token);

    const result = await getUsuarios(email);

    if (result.rows.length === 0) {
      res.json("Usuario no encontrado");
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.log(error);
    res.status(error.code || 500).send(error);
  }
});

app.post("/usuarios", reportarConsulta, async (req, res) => {
  try {
    const usuario = req.body;
    await agregarUsuario(usuario);
    res.send("Usuario creado con éxito");
  } catch (error) {
    console.log(error);
    res.status(error.code || 500).send(error);
  }
});

app.post("/login", reportarConsulta, async (req, res) => {
  try {
    const { email, password } = req.body;
    await verificarCredenciales(email, password);
    const token = jwt.sign({ email }, "az_AZ");
    res.json(token);
  } catch (error) {
    console.log(error);
    res.status(error.code || 500).send(error);
  }
});

app.get("*", (req, res) => {
  res.status(404).send("Esta ruta no existe");
});

app.listen(3000, console.log("SERVER USUARIOS ON"));
