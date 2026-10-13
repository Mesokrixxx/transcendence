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