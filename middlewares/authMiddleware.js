// Middleware para verificar se o usuário está autenticado
function autenticado(req, res, next) {
    if (req.session.userId) {
      next();
    } else {
      res.redirect('/login');
    }
}

module.exports = {autenticado}
