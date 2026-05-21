/* =========================
   VALIDADORES
========================= */

export const usernameRegex =
  /^[a-zA-Z0-9]+$/;

export const emailRegex =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export const nameRegex =
  /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;

export const phoneRegex =
  /^\d+$/;