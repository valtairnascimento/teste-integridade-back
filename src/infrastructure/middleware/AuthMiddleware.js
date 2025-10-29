const jwt = require('jsonwebtoken');


class AuthMiddleware {

  static autenticarEmpresa(req, res, next) {
    try {
      const authHeader = req.headers['authorization'];

      if (!authHeader) {
        return res.status(401).json({
          success: false,
          error: 'Token não fornecido'
        });
      }

      const parts = authHeader.split(' ');
      
      if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return res.status(401).json({
          success: false,
          error: 'Formato de token inválido'
        });
      }

      const token = parts[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (!decoded.id || !decoded.email) {
        return res.status(401).json({
          success: false,
          error: 'Token inválido'
        });
      }

      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role || 'empresa'
      };

      next();

    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          error: 'Token inválido'
        });
      }

      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          error: 'Token expirado'
        });
      }

      return res.status(500).json({
        success: false,
        error: 'Erro ao validar token'
      });
    }
  }

 
  static autenticarCandidato(req, res, next) {
    try {
      const authHeader = req.headers['authorization'];

      if (!authHeader) {
        return res.status(401).json({
          success: false,
          error: 'Token não fornecido'
        });
      }

      const parts = authHeader.split(' ');
      
      if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return res.status(401).json({
          success: false,
          error: 'Formato de token inválido'
        });
      }

      const token = parts[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (!decoded.testeId || !decoded.email || !decoded.empresaId) {
        return res.status(401).json({
          success: false,
          error: 'Token de candidato inválido'
        });
      }

      req.candidato = {
        testeId: decoded.testeId,
        email: decoded.email,
        empresaId: decoded.empresaId,
        candidatoId: decoded.candidatoId
      };

      next();

    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          error: 'Token inválido'
        });
      }

      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          error: 'Token expirado'
        });
      }

      return res.status(500).json({
        success: false,
        error: 'Erro ao validar token'
      });
    }
  }

  
  static autenticacaoOpcional(req, res, next) {
    try {
      const authHeader = req.headers['authorization'];

      if (!authHeader) {
        req.user = null;
        return next();
      }

      const parts = authHeader.split(' ');
      
      if (parts.length !== 2 || parts[0] !== 'Bearer') {
        req.user = null;
        return next();
      }

      const token = parts[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role
      };

      next();

    } catch (error) {
      req.user = null;
      next();
    }
  }


  static verificarRole(...rolesPermitidos) {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Não autenticado'
        });
      }

      if (!rolesPermitidos.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          error: 'Sem permissão para acessar este recurso'
        });
      }

      next();
    };
  }

 
  static rateLimiter(maxRequests = 100, windowMs = 15 * 60 * 1000) {
    const requests = new Map();

    return (req, res, next) => {
      const identifier = req.user?.id || req.ip;
      const now = Date.now();
      
      if (!requests.has(identifier)) {
        requests.set(identifier, []);
      }

      const userRequests = requests.get(identifier);
      
      const validRequests = userRequests.filter(
        time => now - time < windowMs
      );

      if (validRequests.length >= maxRequests) {
        return res.status(429).json({
          success: false,
          error: 'Muitas requisições. Tente novamente mais tarde.'
        });
      }

      validRequests.push(now);
      requests.set(identifier, validRequests);

      next();
    };
  }
}

module.exports = AuthMiddleware;