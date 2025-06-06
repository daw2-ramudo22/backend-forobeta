const jwt = require('jsonwebtoken');

//Comprobamos si el usuario ha iniciado sesión correctamente
function autenticarToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  //Si no hay token, devolvemos un error 401
  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  //Verificamos el token
  jwt.verify(token, process.env.JWT_SECRET || '123', (err, usuario) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }

    //Guardamos id del usuario
    req.usuarioId = usuario.id;
    next();
  });
}

module.exports = autenticarToken;
