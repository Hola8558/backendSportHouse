export class DuplicateElementError extends Error {
  constructor(email: string) {
    super(`Usuario con email ${email} ya existe`);
    this.name = 'DuplicateUserError';
  }
}