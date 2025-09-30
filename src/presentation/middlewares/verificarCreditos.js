const Empresa = require('../../infrastructure/models/Empresa');

const verificarCreditos = async (req, res, next) => {
  const empresaId = req.user.id; // Obtido do authMiddleware
  const empresa = await Empresa.findById(empresaId);

  if (!empresa) {
    return res.status(404).json({ error: 'Empresa não encontrada' });
  }

  if (empresa.creditos < 1) {
    return res.status(402).json({ error: 'Créditos insuficientes. Compre mais créditos.' });
  }

  // Deduz 1 crédito para a ação (ex.: gerar teste)
  empresa.creditos -= 1;
  await empresa.save();

  req.empresa = empresa; // Passa para o controller se necessário
  next();
};

module.exports = verificarCreditos;