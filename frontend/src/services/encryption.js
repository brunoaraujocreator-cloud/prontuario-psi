import CryptoJS from 'crypto-js';

// Derive encryption key from user password
function deriveKey(password, salt) {
  return CryptoJS.PBKDF2(password, salt, {
    keySize: 256 / 32,
    iterations: 10000
  });
}

// Get or create salt for user
function getSalt(userId) {
  let salt = localStorage.getItem(`encryption_salt_${userId}`);
  if (!salt) {
    salt = CryptoJS.lib.WordArray.random(128/8).toString();
    localStorage.setItem(`encryption_salt_${userId}`, salt);
  }
  return salt;
}

export const encryptionService = {
  // Encrypt sensitive data
  encrypt(data, password, userId) {
    try {
      const encPassword = password || sessionStorage.getItem('encryption_password');
      if (!encPassword) throw new Error('Password de criptografia não encontrada');
      
      const salt = getSalt(userId);
      const key = deriveKey(encPassword, salt);
      const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), key.toString()).toString();
      return encrypted;
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Erro ao criptografar dados');
    }
  },

  // Decrypt sensitive data
  decrypt(encryptedData, password, userId) {
    try {
      const encPassword = password || sessionStorage.getItem('encryption_password');
      if (!encPassword) throw new Error('Password de criptografia não encontrada');

      const salt = getSalt(userId);
      const key = deriveKey(encPassword, salt);
      const bytes = CryptoJS.AES.decrypt(encryptedData, key.toString());
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Erro ao descriptografar dados');
    }
  },

  // Encrypt CPF
  encryptCPF(cpf, password, userId) {
    return this.encrypt({ cpf }, password, userId);
  },

  // Decrypt CPF
  decryptCPF(encryptedCPF, password, userId) {
    const decrypted = this.decrypt(encryptedCPF, password, userId);
    return decrypted.cpf;
  }
};



