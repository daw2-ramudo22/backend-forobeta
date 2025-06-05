const jwt = require('jsonwebtoken');

function autenticarToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  jwt.verify(token, process.env.JWT_SECRET || '123', (err, usuario) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }

    req.usuarioId = usuario.id;
    next();
  });
}

module.exports = autenticarToken;
