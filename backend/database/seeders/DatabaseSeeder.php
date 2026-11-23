<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     *
     * El contenido depende del ambiente:
     *
     * - En produccion (APP_ENV=production) corre InitialSetupSeeder: las
     *   categorias y el super administrador, nada mas. Los negocios de
     *   prueba son datos ficticios y no tienen lugar en un despliegue real.
     *
     * - En cualquier otro ambiente corre DemoDataSeeder: categorias, super
     *   administrador y los negocios de prueba con sus duenos, empleados y
     *   servicios, que son los que hacen util el desarrollo local.
     *
     * Ambos seeders son idempotentes: se pueden volver a correr sin
     * duplicar registros.
     */
    public function run(): void
    {
        if (app()->environment('production')) {
            $this->call(InitialSetupSeeder::class);

            return;
        }

        $this->call(DemoDataSeeder::class);
    }
}
