import type {
  APIError,
  APIResponse,
  Method,
  RequestOptions,
} from '../types/fetch';
import i18next from 'i18next';

const getURL = () => {
  return '/api';
};

const getFetchOptions = (
  body: object | null,
  method: Method,
): RequestOptions => {
  let requestBody = null;

  if (body !== null && method !== 'get') {
    requestBody = JSON.stringify(body);
  }

  return {
    body: requestBody,
    credentials: 'include',
    headers: {
      'content-type': 'application/json',
    },
    method,
    mode: 'cors',
  };
};

const fetchAPI = async <Data = unknown>({
  path,
  body,
  method,
}: {
  path: string;
  body?: object;
  method: Method;
}): Promise<APIResponse<Data>> => {
  try {
    const response = await fetch(
      `${getURL()}${path}`,
      getFetchOptions(body ?? null, method),
    );

    const text = await response.text();
    let result: unknown = undefined;

    if (text.trim() !== '') {
      try {
        result = JSON.parse(text);
      } catch {
        return {
          result: {
            error: i18next.t('invalidJSONResponse', { ns: 'common' }),
          },
          error: true,
        };
      }
    }

    if (!response.ok) {
      let apiError: APIError = {
        error: i18next.t('requestFailed', { ns: 'common' }),
      };

      if (typeof result === 'string') {
        apiError = result;
      } else if (
        typeof result === 'object' &&
        result !== null &&
        'error' in result &&
        typeof result.error === 'string'
      ) {
        apiError = { error: result.error };

        if ('details' in result && Array.isArray(result.details)) {
          apiError = {
            error: result.error,
            details: result.details,
          };
        }
      }

      return {
        result: apiError,
        error: true,
      };
    }

    return {
      result: result as Data,
      error: false,
    };
  } catch {
    return {
      result: {
        error: i18next.t('unableToReachServer', { ns: 'common' }),
      },
      error: true,
    };
  }
};

export default fetchAPI;

// import type { APIResponse, Method, RequestOptions } from '../types/fetch';

// const getURL = () => {
//   return import.meta.env.VITE_API_URL;
// };

// const getFetchOptions: (
//   body: object | null,
//   method: Method
// ) => RequestOptions = (body, method) => {
//   return {
//     body: body ? JSON.stringify(body) : null,
//     credentials: 'include',
//     headers: {
//       'content-type': 'application/json',
//     },
//     method,
//     mode: 'cors',
//   };
// };

// const fetchAPI: ({
//   path,
//   body,
//   method,
// }: {
//   path: string;
//   body?: object;
//   method: Method;
// }) => Promise<APIResponse<any>> = async ({ path, body, method }) => {
//   try {
//     const response = await fetch(
//       `${getURL()}${path}`,
//       getFetchOptions(body ?? null, method)
//     );
//     const result = await response.json();
//     return {
//       result,
//       error: response.status >= 400,
//     };
//   } catch (e) {
//     return {
//       result: {
//         error: {
//           title: 'Unexpected Error',
//           msg: 'Unexpected error during fetch.',
//           statusCode: 500,
//         },
//       },
//       error: true,
//     };
//   }
// };

// export default fetchAPI;
