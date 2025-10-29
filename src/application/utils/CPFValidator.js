class CPFValidator {

  static limpar(cpf) {
    if (!cpf) return '';
    return cpf.toString().replace(/\D/g, '');
  }

 
  static validar(cpf) {
    const cpfLimpo = this.limpar(cpf);

    if (cpfLimpo.length !== 11) return false;

    if (/^(\d)\1{10}$/.test(cpfLimpo)) return false;

    let soma = 0;
    for (let i = 0; i < 9; i++) {
      soma += parseInt(cpfLimpo.charAt(i)) * (10 - i);
    }
    let resto = 11 - (soma % 11);
    let digito1 = resto >= 10 ? 0 : resto;

    if (digito1 !== parseInt(cpfLimpo.charAt(9))) return false;

    soma = 0;
    for (let i = 0; i < 10; i++) {
      soma += parseInt(cpfLimpo.charAt(i)) * (11 - i);
    }
    resto = 11 - (soma % 11);
    let digito2 = resto >= 10 ? 0 : resto;

    return digito2 === parseInt(cpfLimpo.charAt(10));
  }

  
  static validarOuLancarErro(cpf) {
    const cpfLimpo = this.limpar(cpf);

    if (!cpfLimpo) {
      throw new Error('CPF é obrigatório');
    }

    if (cpfLimpo.length !== 11) {
      throw new Error('CPF deve ter 11 dígitos');
    }

    if (!this.validar(cpfLimpo)) {
      throw new Error('CPF inválido');
    }

    return cpfLimpo;
  }

 
  static formatar(cpf) {
    const cpfLimpo = this.limpar(cpf);

    if (cpfLimpo.length !== 11) return cpf;

    return cpfLimpo.replace(
      /(\d{3})(\d{3})(\d{3})(\d{2})/,
      '$1.$2.$3-$4'
    );
  }


  static validarEFormatar(cpf) {
    const cpfLimpo = this.validarOuLancarErro(cpf);
    return this.formatar(cpfLimpo);
  }

 
  static gerar() {
    const n1 = Math.floor(Math.random() * 9);
    const n2 = Math.floor(Math.random() * 9);
    const n3 = Math.floor(Math.random() * 9);
    const n4 = Math.floor(Math.random() * 9);
    const n5 = Math.floor(Math.random() * 9);
    const n6 = Math.floor(Math.random() * 9);
    const n7 = Math.floor(Math.random() * 9);
    const n8 = Math.floor(Math.random() * 9);
    const n9 = Math.floor(Math.random() * 9);

    let soma = n1 * 10 + n2 * 9 + n3 * 8 + n4 * 7 + n5 * 6 + 
               n6 * 5 + n7 * 4 + n8 * 3 + n9 * 2;
    let resto = (soma * 10) % 11;
    const d1 = resto === 10 ? 0 : resto;

    soma = n1 * 11 + n2 * 10 + n3 * 9 + n4 * 8 + n5 * 7 + 
           n6 * 6 + n7 * 5 + n8 * 4 + n9 * 3 + d1 * 2;
    resto = (soma * 10) % 11;
    const d2 = resto === 10 ? 0 : resto;

    return `${n1}${n2}${n3}${n4}${n5}${n6}${n7}${n8}${n9}${d1}${d2}`;
  }
}

module.exports = CPFValidator;