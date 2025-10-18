// Funciones de validación para formularios

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string): { 
  valid: boolean; 
  errors: string[] 
} {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('La contraseña debe tener al menos 8 caracteres');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Debe contener al menos una mayúscula');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Debe contener al menos una minúscula');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Debe contener al menos un número');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

export function validatePhone(phone: string): boolean {
  // Validar número argentino
  const phoneRegex = /^(\+54)?[ ]?(11|[2368]\d)[ ]?\d{4}[ ]?\d{4}$/;
  return phoneRegex.test(phone);
}

export function validateCBU(cbu: string): boolean {
  // CBU argentino: 22 dígitos
  return /^\d{22}$/.test(cbu);
}

export function validatePostalCode(code: string): boolean {
  // Código postal argentino: 4 dígitos o formato ANNNAAA
  return /^(\d{4}|[A-Z]\d{4}[A-Z]{3})$/.test(code);
}

export function validateMinQuantity(quantity: number, min: number = 5): boolean {
  return quantity >= min;
}

export function validateStock(quantity: number, stock: number): boolean {
  return quantity <= stock && stock >= 0;
}

