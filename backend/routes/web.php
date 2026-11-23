<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// -----------------------------------------------------------------------------
// Ruta `login`
//
// Laravel, cuando una peticion no autenticada llega a una ruta protegida,
// redirige a la ruta nombrada `login`. Si esa ruta no existe, la peticion
// revienta con RouteNotFoundException y el cliente recibe un 500 en lugar de
// un 401.
//
// Esta aplicacion es una API con tokens Bearer: no hay login por formulario ni
// vistas de sesion. El frontend manda el token en la cabecera Authorization y
// guarda la sesion en localStorage.
//
// La ruta existe solo para que Laravel pueda resolver el redirect. Con la
// cabecera `Accept: application/json` (que es lo que manda el frontend y
// axios con Accept: application/json) la respuesta es un 401 con el JSON de
// error, que es lo que la SPA espera para limpiar la sesion y redirigir al
// login.
//
// La ruta no se registra en modo API: `->withRouting(then: ...)` la omite
// cuando no hay peticiones web.
// -----------------------------------------------------------------------------
Route::get('/login', function () {
    return response()->json([
        'message' => 'Unauthenticated.',
    ], 401);
})->name('login');
