<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie', 'login', 'register', 'logout'],

    'allowed_methods' => ['*'],

    // Los origenes permitidos vienen de la variable de entorno
    // CORS_ALLOWED_ORIGINS, separada por comas.
    //
    // En desarrollo (compose) son los dos loopbacks del Vite dev server:
    // el navegador manda uno u otro segun como se abrio la pagina, y una
    // diferencia aqui falla toda llamada a la API con error de CORS.
    //
    // En produccion es el dominio real del sitio
    // (https://getbela.syrexsoftware.com). El valor por defecto mantiene el
    // comportamiento de desarrollo si la variable no esta definida.
    'allowed_origins' => array_values(array_filter(
        array_map('trim', explode(',', (string) env('CORS_ALLOWED_ORIGINS', 'http://localhost:5173,http://127.0.0.1:5173')))
    )),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,

];
