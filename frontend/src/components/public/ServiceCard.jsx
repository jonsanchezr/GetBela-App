import React from "react";
import { Link } from "react-router-dom";
import { apiUrl } from "../../api/apiUrl";

const ServiceCard = ({ service, businessName }) => {
  return (
    <Link to={`/servicio/${service.id}`}>
      <div 
        className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col h-full"
      >
        {/* Imagen y categoría */}
        <div className="h-48 bg-gray-100 relative overflow-hidden">
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
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
              Sin imagen
            </div>
          )}
          {service.category && (
            <span className="absolute top-2 right-2 bg-purple-950 text-white text-[10px] px-2 py-1 rounded-full uppercase tracking-wider font-bold">
              {service.category.name}
            </span>
          )}
        </div>

        {/* Información del servicio */}
        <div className="p-4 flex-1 flex flex-col justify-between">
          <div>
            <span className="text-xs text-purple-800 font-semibold block mb-1">
              {businessName || service.business?.name || "Estilista Independiente"}
            </span>
            <h4 className="font-bold text-gray-800 text-base mb-2 line-clamp-1">
              {service.name}
            </h4>
          </div>

          <div className="pt-3 border-t border-gray-100 flex items-center justify-between mt-2">
            <span className="text-purple-950 font-extrabold text-lg">
              ${Number(service.price).toFixed(2)}
            </span>
            <span className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-1 rounded">
              ⏱️ {service.duration_minutes} min
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ServiceCard;