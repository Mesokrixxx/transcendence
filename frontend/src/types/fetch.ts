// Types adaptés du modèle de Noa aux réponses du backend.

 export type Method = 'get' | 'post' | 'put' | 'delete'

export interface RequestOptions {
    body: string | null
    credentials: 'include'
    headers: {
        [key: string]: string
    }
    method: Method
    mode: 'cors'
}

export type APIError =
    | string
    | {
        error: string
        details?: unknown[]
    }

export type APIResponse<Data> =
    | SuccessfulResponse<Data>
    | ErrorResponse

export interface SuccessfulResponse<Data> {
    result: Data
    error: false
}

export interface ErrorResponse {
    result: APIError
    error: true
}

 // type Method = 'get' | 'post' | 'put' | 'delete';

 // interface RequestOptions {
 //   body: string | null;
 //   credentials: 'include';
 //   headers: {
 //     [key: string]: string;
 //   };
 //   method: Method;
 //   mode: 'cors';
 // }

 // type APIResponse<Data> =
 //   | SuccessfulResponse<Data>
 //   | ErrorResponse;

 // interface SuccessfulResponse<Data> {
 //   result: Data;
 //   error: false;
 // }

 // interface ErrorResponse {
 //   result: APIError; // Type d'erreur à définir avec le backend
 //   error: true;
 // }
