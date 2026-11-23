import React from "react";
import { useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const isSettings = location.pathname.startsWith("/configuracion");
  const isAdmin = user?.role === "admin";

  return (
    <aside className="w-64 bg-purple-950 min-h-[calc(100vh-4rem)] p-6 text-white sticky top-16 self-start">
      {/* Logo del negocio (solo para owner/employee) */}
      {!isAdmin && user?.business && (
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-20 h-20 rounded-full border-4 border-purple-800 bg-purple-900 flex items-center justify-center overflow-hidden mb-3 shadow-lg">
            <span className="text-4xl font-bold text-white">
              {user.business.name.charAt(0).toUpperCase()}
            </span>
            {user.business.logo && (
              <img
                src={`${import.meta.env.VITE_API_URL ?? ""}/storage/${user.business.logo}`}
                alt="Logo"
                className="absolute inset-0 w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            )}
          </div>
        </div>
      )}

      <nav className="space-y-4">
        {isAdmin ? (
          /* Navegación exclusiva del Super Admin */
          <>
            <Link to="/admin" className="block">
              📊 Dashboard
            </Link>
            <div className="border-t border-purple-800 my-2"></div>
            <Link to="/admin/categories" className="block text-purple-300">
              🗂️ Categorías
            </Link>
            <Link to="/admin/banners" className="block text-purple-300">
              🖼️ Carrusel
            </Link>
            <Link to="/admin/contacts" className="block text-purple-300">
              📞 Contacto
            </Link>
          </>
        ) : isSettings ? (
          <>
            <Link to="/dashboard" className="block text-purple-300">
              ⬅️ Volver
            </Link>
            <div className="border-t border-purple-800 my-4"></div>
            <Link to="/configuracion/business" className="block font-bold">
              💼 Mi Negocio
            </Link>
            <Link to="/configuracion/business-hours" className="block font-bold">
              🕒 Mi Horario
            </Link>
          </>
        ) : (
          <>
            <Link to="/dashboard" className="block">
              📊 Dashboard
            </Link>

            {/* Liquidaciones (solo dueño) */}
            {user?.role === "owner" && (
              <Link to="/liquidaciones" className="block text-purple-300">
                💵 Liquidaciones
              </Link>
            )}

            {/* Enlaces para owner/employee */}
            <Link to="/appointments" className="block text-purple-300">
              📅 Citas
            </Link>
            {user?.role !== "employee" && (
              <Link to="/configuracion" className="block text-purple-300">
                ⚙️ Configuración
              </Link>
            )}
            {user?.role !== "employee" && (
              <Link to="/employees" className="block text-purple-300">
                👔 Empleados
              </Link>
            )}
            <Link to="/services" className="block text-purple-300">
              💅 Servicios
            </Link>
            <Link to="/products" className="block text-purple-300">
              🧴 Productos
            </Link>
            <Link to="/postview" className="block text-purple-300">
              🛒 Venta
            </Link>
          </>
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;
