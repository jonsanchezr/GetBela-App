// src/pages/public/ServiceDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../api/axios";
import { apiUrl } from "../../api/apiUrl";
import MainLayout from "../../layouts/MainLayout";
import {
  Sparkles,
  ArrowLeft,
  Clock,
  DollarSign,
  Store,
  CheckCircle2,
} from "lucide-react";
import AppointmentForm from "../../components/public/AppointmentForm";

const ServiceDetail = () => {
  const { id } = useParams();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchService = async () => {
      try {
        // Petición a la ruta pública del backend
        const response = await api.get(`/api/public/services/${id}`);
        setService(response.data.service);
      } catch (error) {
        console.error("Error al obtener el detalle del servicio", error);
      } finally {
        setLoading(false);
      }
    };
    fetchService();
  }, [id]);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center py-32 text-purple-950 font-medium">
          Cargando detalles del servicio...
        </div>
      </MainLayout>
    );
  }

  if (!service) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto my-16 text-center bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
          <h2 className="text-2xl font-bold text-purple-950 mb-2">
            Servicio no encontrado
          </h2>
          <p className="text-gray-500 mb-6">
            El servicio que buscas ya no está disponible o la URL es incorrecta.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-purple-950 text-white px-6 py-3 rounded-xl font-bold hover:bg-purple-900 transition-all shadow-md"
          >
            <ArrowLeft className="w-5 h-5" /> Volver al Catálogo
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Botón para regresar */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-purple-950 font-semibold mb-6 hover:text-purple-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" /> Volver al Catálogo
        </Link>

        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm grid grid-cols-1 md:grid-cols-2 gap-0">
          {/* Imagen del Servicio */}
          <div className="h-72 md:h-full min-h-[300px] bg-gray-100 relative overflow-hidden">
            {service.image_url ? (
              <img
                src={
                  service.image_url.startsWith("http")
                    ? service.image_url
                    : apiUrl(`/storage/${service.image_url}`)
                }
                alt={service.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                <Sparkles className="w-12 h-12" />
                <span>Sin imagen disponible</span>
              </div>
            )}
            {service.category && (
              <span className="absolute top-4 left-4 bg-purple-950 text-white text-xs px-3 py-1.5 rounded-full uppercase tracking-wider font-bold shadow-md">
                {service.category.name}
              </span>
            )}
          </div>

          {/* Información y Detalles */}
          <div className="p-6 md:p-8 flex flex-col justify-between">
            <div>
              {/* Negocio o Estilista */}
              <div className="flex items-center gap-2 text-purple-800 font-semibold text-sm mb-2">
                <Store className="w-4 h-4" />
                <Link
                  to={`/business/${service.business_id}`}
                  className="font-bold text-purple-800 hover:underline transition-all"
                >
                  {service.business.name}
                </Link>
              </div>

              {/* Nombre del servicio */}
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-4">
                {service.name}
              </h1>

              {/* Estilista Asignado (Ubicado exactamente donde pediste) */}
              <div className="text-sm mb-4">
                <span className="font-semibold text-gray-500 uppercase text-xs tracking-wider block mb-0.5">
                  Estilista:
                </span>
                <span className="font-bold text-purple-700 text-base">
                  {service.employee?.name || "No asignado"}
                </span>
              </div>

              {/* Descripción */}
              <div className="mb-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                  Descripción del servicio
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {service.description ||
                    "Este servicio no cuenta con una descripción detallada, pero puedes realizar tu reserva directamente con el profesional."}
                </p>
              </div>

              {/* PRODUCTOS / INSUMOS ASOCIADOS AL SERVICIO */}
              {service.products && service.products.length > 0 && (
                <div className="mb-6 bg-purple-50/60 border border-purple-100 p-4 rounded-xl">
                  <span className="text-xs font-bold text-purple-900 uppercase tracking-wider block mb-2">
                    Insumos y productos utilizados:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {service.products.map((prod) => (
                      <span
                        key={prod.id}
                        className="bg-white border border-purple-200 text-purple-950 text-xs px-3 py-1 rounded-lg font-medium shadow-2xs"
                      >
                        {prod.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Características (Precio y Duración) */}
              <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-100 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-950 font-bold">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 block font-medium">
                      Precio
                    </span>
                    <span className="text-lg font-extrabold text-purple-950">
                      ${Number(service.price).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-950 font-bold">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 block font-medium">
                      Duración
                    </span>
                    <span className="text-lg font-extrabold text-purple-950">
                      {service.duration_minutes} min
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Botón de Acción / Reserva */}
            <div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full bg-purple-950 hover:bg-purple-900 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" /> Reservar Cita
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Renderizar el Modal pasando el servicio y control de cierre */}
      <AppointmentForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        service={service}
      />
    </MainLayout>
  );
};

export default ServiceDetail;
