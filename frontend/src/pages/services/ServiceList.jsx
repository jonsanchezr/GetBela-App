// src/pages/services/ServiceList.jsx
import React, { useState, useEffect } from "react";
import api from "../../api/axios"; // Asegura la ruta a tu instancia de axios
import { apiUrl } from "../../api/apiUrl";
import ServiceForm from "../../components/services/ServiceForm";

const ServiceList = () => {
  const [services, setServices] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [errors, setErrors] = useState({});
  const [categories, setCategories] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [allProducts, setAllProducts] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      await fetchServices();
      try {
        const responseCategories = await api.get("/api/categories");
        const categoriesData =
          responseCategories.data.categories || responseCategories.data;
        setCategories(categoriesData);

        const responseEmployees = await api.get("/api/employees").catch(() => null);
        if (responseEmployees?.data) {
          const employeeData =
            responseEmployees.data.employees || responseEmployees.data;
          setEmployees(employeeData);
        } else {
          setEmployees([]);
        }

        const response = await api.get("/api/products");
        const productsData = response.data.products || response.data;
        // Filtramos aquí mismo antes de guardarlos en el estado
        const filtered = productsData.filter(
          (p) => p.type === "uso_interno" || p.type === "mixto",
        );
        setAllProducts(filtered);
      } catch (error) {
        console.error("Error al cargar productos para el select", error);
      }
    };
    loadData();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await api.get("/api/services");
      // Ajustamos según la estructura que devuelva tu API
      setServices(response.data.services || response.data);
    } catch (error) {
      console.error("Error al cargar servicios", error);
    }
  };

  const handleSaveService = async (data) => {
    const formData = new FormData();

    // Agregar todos los campos al FormData
    for (const key in data) {
      // Si el valor es booleano, conviértelo a 1 o 0
      if (typeof data[key] === "boolean") {
        formData.append(key, data[key] ? 1 : 0);
      } else if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    }

    if (data.products && Array.isArray(data.products)) {
      formData.append("products", JSON.stringify(data.products));
    }

    // Si estás editando, Laravel a veces requiere _method: 'PUT' para archivos
    if (selectedService) {
      formData.append("_method", "PUT");
    }

    try {
      if (selectedService) {
        await api.post(`/api/services/${selectedService.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post("/api/services", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      fetchServices();
      setIsModalOpen(false);
    } catch (error) {
      if (error.response && error.response.status === 422) {
        setErrors(error.response.data.errors);
      } else {
        console.error("Error al guardar:", error);
      }
    }
  };

  const handleOpenModal = (service = null) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Seguro que deseas eliminar este servicio?")) {
      try {
        await api.delete(`/api/services/${id}`);
        fetchServices();
      } catch (error) {
        alert("No se pudo eliminar el servicio.");
      }
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">Gestión de Servicios</h1>
        <button
          onClick={() => handleOpenModal()}
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
        >
          + Nuevo Servicio
        </button>
      </div>

      <table className="w-full border-collapse">
        <thead className="bg-purple-900 text-white">
          <tr>
            <th className="p-4">Imagen</th>
            <th className="p-4">Nombre</th>
            <th className="p-4">Categoria</th>
            <th className="p-4">Estilista</th>
            <th className="p-4">Precio</th>
            <th className="p-4">Duración</th>
            <th className="p-4">Estado</th>
            <th className="p-4 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {services.map((service) => (
            <tr key={service.id}>
              <td className="p-4">
                {service.image_url ? (
                  <img
                    src={apiUrl(`/storage/${service.image_url}`)}
                    alt={service.name}
                    className="w-12 h-12 rounded object-cover" // Cuadrada 12x12
                  />
                ) : (
                  <span className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-[10px]">
                    Sin img
                  </span>
                )}
              </td>
              <td className="p-4">{service.name}</td>
              <td className="p-4">{service.category?.name || "Sin categoría"}</td>
              <td className="p-4">{service.employee?.name || "Sin asignar"}</td>
              <td className="p-4">${service.price}</td>
              <td className="p-4">{service.duration_minutes} min</td>
              <td className="p-4">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    service.is_active
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {service.is_active ? "Activo" : "Inactivo"}
                </span>
              </td>
              <td className="p-4 text-center">
                <button
                  onClick={() => handleOpenModal(service)}
                  className="text-purple-600 mr-2"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(service.id)}
                  className="text-red-600"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ServiceForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={selectedService}
        onSubmit={handleSaveService}
        categories={categories}
        employees={employees}
        products={allProducts}
        errors={errors}
      />
    </div>
  );
};

export default ServiceList;
