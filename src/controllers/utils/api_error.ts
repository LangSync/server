export class ApiError extends Error {
  statusCode: number;

  constructor(options: ErrorOptions) {
    super(options.message);
    this.statusCode = options.statusCode;
  }
}

type ErrorOptions = {
  message: string;
  statusCode: number;
};
