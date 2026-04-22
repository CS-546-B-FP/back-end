const DEFAULT_SERVER_ERROR_MESSAGE = 'internal server error';

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

      return result === undefined
        ? sendApiSuccess(res, undefined, successStatus)
        : sendApiSuccess(res, result, successStatus);
    } catch (error) {
      const status = getErrorStatus ? getErrorStatus(error, req, res, next) : errorStatus;
      return sendApiError(res, error, { status, fallbackMessage });
    }
  };
