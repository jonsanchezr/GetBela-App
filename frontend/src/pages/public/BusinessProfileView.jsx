import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom"; // Si usas React Router
import api from "../../api/axios";
import { apiUrl } from "../../api/apiUrl";
import MainLayout from "../../layouts/MainLayout";
import ServiceCard from "../../components/public/ServiceCard";

const BusinessProfileView = () => {
  const { id } = useParams(); // Captura el ID de la URL (ej: /business/1)
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        const response = await api.get(`/api/public/business/${id}`);
        setBusiness(response.data.business);
      } catch (error) {
        console.error("Error al cargar el perfil del negocio:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBusiness();
  }, [id]);

  if (loading) {
    return (
      <MainLayout>
        <div className="text-center py-20 text-purple-950 font-bold">
          Cargando perfil...
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 pb-12">
        <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
          {/* Cabecera / Perfil Principal */}
          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xl border border-purple-100/60 flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Logo o Imagen redonda grande a la izquierda */}
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-purple-100 overflow-hidden bg-gray-100 shrink-0 shadow-md">
              <img
                src={
                  apiUrl(`/storage/${business.logo}`)
                }
                alt={business.name || "Negocio"}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Información principal al lado */}
            <div className="flex-1 text-center md:text-left space-y-2">
              <h1 className="text-3xl font-bold text-purple-950">
                {business.name || "Nombre del Negocio"}
              </h1>

              <div className="flex flex-wrap justify-center md:justify-start items-center gap-2">
                <span className="bg-purple-100 text-purple-800 text-xs font-bold px-3 py-1 rounded-full uppercase">
                  {business.type || "Tipo"}
                </span>
                <span className="bg-purple-50 border border-purple-200 text-purple-700 text-xs font-semibold px-3 py-1 rounded-full">
                  {business.modality || "Modalidad"}
                </span>
              </div>

              <p className="text-sm text-gray-600 flex items-center justify-center md:justify-start gap-2 pt-1">
                <span>📍</span>{" "}
                {business.address || "Dirección no especificada"}
              </p>
              <p className="text-sm text-gray-600 flex items-center justify-center md:justify-start gap-2">
                <span>📞</span> {business.phone || "Sin teléfono"}
              </p>
            </div>
          </div>

          {/* Sección de Descripción */}
          {business.description && (
            <div className="bg-white p-6 rounded-3xl shadow-md border border-purple-100/60">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Acerca del negocio
              </h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                {business.description}
              </p>
            </div>
          )}

          {/* Catálogo de Servicios */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-purple-950 px-1">
              Servicios Disponibles
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {business.services && business.services.length > 0 ? (
                business.services.map((service) => (
                  <ServiceCard
                    service={service} 
                    businessName={business.name} 
                  />
                ))
              ) : (
                <p className="text-sm text-gray-400 italic col-span-2 text-center py-6 bg-white rounded-2xl border border-purple-100/60">
                  No hay servicios registrados por el momento.
                </p>
              )}
            </div>
          </div>

          {/* Sección de Estilistas / Equipo */}
          {business.type == 'salon' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-purple-950 px-1">
                Nuestros Estilistas
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {business.employees && business.employees.length > 0 ? (
                  business.employees.map((employee) => (
                    <div
                      key={employee.id}
                      className="bg-white p-4 rounded-2xl shadow-md border border-purple-100/60 flex items-center gap-3"
                    >
                      <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-800 font-bold flex items-center justify-center shrink-0">
                        {employee.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm">
                          {employee.name}
                        </h4>
                        <span className="text-xs text-purple-700 font-medium">
                          {employee.specialty || "Estilista profesional"}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-400 italic col-span-3 text-center py-6 bg-white rounded-2xl border border-purple-100/60">
                    No hay estilistas registrados en este perfil.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default BusinessProfileView;
