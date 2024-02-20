export * from './token';
export * from './user';
export * from './cards';
export * from './transactions';

export type Result<T, E> =
  | { result: 'success'; data: T }
  | { result: 'error'; error: E };
