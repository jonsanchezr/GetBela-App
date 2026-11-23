<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class InitialSetupSeeder extends Seeder
{
    /**
     * Configuración inicial mínima: categorías y super administrador.
     *
     * Es idempotente, por lo que se puede ejecutar varias veces sin duplicar
     * registros. No crea negocios de prueba (eso lo hace DemoDataSeeder).
     */
    public function run(): void
    {
        $this->call(CategorySeeder::class);

        $admin = User::firstOrCreate(
            ['email' => self::adminEmail()],
            [
                'name' => 'Admin GetBela',
                'password' => Hash::make(self::adminPassword()),
                'role' => 'admin',
                'business_id' => null,
            ]
        );

        // El super admin siempre debe estar fuera de cualquier negocio.
        if ($admin->role !== 'admin' || $admin->business_id !== null) {
            $admin->update([
                'role' => 'admin',
                'business_id' => null,
            ]);
        }
    }

    /**
     * Email del super administrador.
     *
     * Configurable por GETBELA_ADMIN_EMAIL para no dejar la direccion de
     * ejemplo hardcodeada en el seeder de produccion.
     */
    private static function adminEmail(): string
    {
        return (string) (env('GETBELA_ADMIN_EMAIL') ?: 'admin@getbela.com');
    }

    /**
     * Password del super administrador.
     *
     * En produccion llega por GETBELA_ADMIN_PASSWORD, que el grupo declara
     * en su .env. Sin esa variable se usa la de desarrollo, que es publica y
     * no debe quedar en un despliegue real.
     */
    private static function adminPassword(): string
    {
        return (string) (env('GETBELA_ADMIN_PASSWORD') ?: 'password123');
    }
}
