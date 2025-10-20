/**
 * Validador de CPF
 * Implementa algoritmo oficial da Receita Federal
 */
class CPFValidator {
  /**
   * Remove formatação do CPF
   */
  static limpar(cpf) {
    if (!cpf) return '';
    return cpf.toString().replace(/\D/g, '');
  }

  /**
   * Formata CPF: 12345678901 -> 123.456.789-01
   */
  static formatar(cpf) {
    const limpo = this.limpar(cpf);
    if (limpo.length !== 11) return cpf;
    
    return limpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  /**
   * Valida CPF usando algoritmo oficial
   */
  static validar(cpf) {
    const limpo = this.limpar(cpf);

    // Verificar se tem 11 dígitos
    if (limpo.length !== 11) {
      return false;
    }

    // Verificar se não é sequência repetida (111.111.111-11, etc)
    if (/^(\d)\1{10}$/.test(limpo)) {
      return false;
    }

    // Validar primeiro dígito verificador
    let soma = 0;
    for (let i = 0; i < 9; i++) {
      soma += parseInt(limpo.charAt(i)) * (10 - i);
    }
    let resto = soma % 11;
    let digito1 = resto < 2 ? 0 : 11 - resto;

    if (digito1 !== parseInt(limpo.charAt(9))) {
      return false;
    }

    // Validar segundo dígito verificador
    soma = 0;
    for (let i = 0; i < 10; i++) {
      soma += parseInt(limpo.charAt(i)) * (11 - i);
    }
    resto = soma % 11;
    let digito2 = resto < 2 ? 0 : 11 - resto;

    if (digito2 !== parseInt(limpo.charAt(10))) {
      return false;
    }

    return true;
  }

  /**
   * Valida e lança erro se inválido
   */
  static validarOuLancarErro(cpf) {
    if (!this.validar(cpf)) {
      throw new Error('CPF inválido');
    }
    return this.limpar(cpf);
  }

  /**
   * Gera CPF válido aleatório (apenas para testes)
   */
  static gerar() {
    const n = () => Math.floor(Math.random() * 9);
    const nums = Array.from({ length: 9 }, n);

    // Calcular primeiro dígito
    let soma = 0;
    for (let i = 0; i < 9; i++) {
      soma += nums[i] * (10 - i);
    }
    let digito1 = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    nums.push(digito1);

    // Calcular segundo dígito
    soma = 0;
    for (let i = 0; i < 10; i++) {
      soma += nums[i] * (11 - i);
    }
    let digito2 = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    nums.push(digito2);

    return nums.join('');
  }
}

module.exports = CPFValidator;