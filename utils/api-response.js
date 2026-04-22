const DEFAULT_SERVER_ERROR_MESSAGE = 'internal server error';

const isValidHttpStatus = (value) =>
  Number.isInteger(value) && value >= 400 && value <= 599;

const getErrorStatusFromObject = (error) => {
  if (isValidHttpStatus(error?.status)) {
    return error.status;
  }

  if (isValidHttpStatus(error?.statusCode)) {
    return error.statusCode;
  }

  return undefined;
};

const resolveApiErrorStatus = (error, errorStatus, getErrorStatus) => {
  const errorStatusFromObject = getErrorStatusFromObject(error);

  if (errorStatusFromObject !== undefined) {
    return errorStatusFromObject;
  }

  if (typeof getErrorStatus === 'function') {
    return getErrorStatus(error);
  }

  return error instanceof Error ? 500 : errorStatus;
};

export const sendApiSuccess = (res, data, status = 200) => {
  const body = { success: true };

  if (data !== undefined) {
    body.data = data;
  }

  return res.status(status).json(body);
};

export const sendApiError = (
  res,
  error,
  {
    status = 500,
    fallbackMessage = DEFAULT_SERVER_ERROR_MESSAGE
  } = {}
) => {
  const message =
    status >= 500
      ? fallbackMessage
      : typeof error === 'string' && error.trim().length > 0
        ? error
        : error instanceof Error && error.message
          ? error.message
          : fallbackMessage;

  return res.status(status).json({ error: message });
};

export const createApiHandler = (
  handler,
  {
    successStatus = 200,
    errorStatus = 500,
    getErrorStatus,
    fallbackMessage
  } = {}
) =>
  async (req, res, next) => {
    try {
      const result = await handler(req, res, next);

      if (res.headersSent) {
        return;
      }

      return sendApiSuccess(res, result, successStatus);
    } catch (error) {
      const status = resolveApiErrorStatus(error, errorStatus, getErrorStatus);
      return sendApiError(res, error, { status, fallbackMessage });
    }
  };
