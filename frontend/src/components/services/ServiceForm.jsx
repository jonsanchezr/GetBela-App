import React, { useState, useEffect, useId } from "react";
import Modal from "../Modal";
import { apiUrl } from "../../api/apiUrl";

// Construye el estado inicial del formulario a partir de la data recibida.
const buildInitialData = (initialData) =>
  initialData
    ? {
        ...initialData,
        name: initialData.name ?? "",
        description: initialData.description ?? "",
        image_url: initialData.image_url ?? "",
        duration_minutes: initialData.duration_minutes ?? "",
        price: initialData.price ?? "",
        category_id: initialData.category_id || "",
        employee_id: initialData.employee_id || "",
        // Mapeamos los productos existentes para que lean 'quantity_default' del pivot
        products: initialData.products
          ? initialData.products.map((p) => ({
              id: p.id,
              quantity: p.pivot ? p.pivot.quantity_default : 1,
            }))
          : [],
      }
    : {
        name: "",
        category_id: "",
        employee_id: "",
        description: "",
        image_url: "",
        duration_minutes: "",
        price: "",
        products: [],
        is_active: true,
      };

const ServiceForm = ({
  isOpen,
  onClose,
  initialData,
  onSubmit,
  products,
  categories,
  employees,
  errors = {},
}) => {
  const [formData, setFormData] = useState(buildInitialData(initialData));
  const formId = "service-form-" + useId().replace(/[^a-zA-Z0-9]/g, "");

  useEffect(() => {
    setFormData(buildInitialData(initialData));
  }, [initialData, isOpen]);

  const handleMultiSelectProducts = (e) => {
    const selectedIds = Array.from(
      e.target.selectedOptions,
      (option) => option.value,
    );
    if (!selectedIds) return;
    const selectedId = selectedIds[0]; // Obtenemos el ID limpio como string/número

    // Comparamos el ID individual contra los productos ya guardados
    const alreadyExists = formData.products.some((p) => p.id == selectedId);

    if (!alreadyExists) {
      // Si no está, lo añadimos usando el ID individual limpio
      setFormData((prev) => ({
        ...prev,
        products: [...prev.products, { id: selectedId, quantity: 1 }],
      }));
    } else {
      return;
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        image_url: file, // Guardamos el objeto File en el estado
      }));
    }
  };

  const renderError = (field) =>
    errors[field] ? (
      <span className="text-red-500 text-xs mt-1 block">
        {errors[field][0]}
      </span>
    ) : null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Editar Servicio" : "Crear Servicio"}
      formId={formId}
      submitLabel={initialData ? "Actualizar" : "Crear"}
      maxWidth="max-w-2xl"
    >
    <form
      id={formId}
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(formData);
      }}
      className="grid grid-cols-2 gap-4"
    >
      <div className="col-span-2 flex flex-col items-center mb-4">
        <div className="w-24 h-24 bg-gray-200 rounded-lg mb-2 flex items-center justify-center overflow-hidden border">
          {formData.image_url ? (
            <img
              src={
                formData.image_url instanceof File
                  ? URL.createObjectURL(formData.image_url) // 1. Si el usuario eligió un archivo nuevo
                  : formData.image_url &&
                      typeof formData.image_url === "string" &&
                      !formData.image_url.startsWith("http")
                    ? apiUrl(`/storage/${formData.image_url}`) // 2. Si es la ruta guardada en BD
                    : formData.image_url // 3. Si es una URL completa externa
              }
              alt="Preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-[10px] text-gray-400 text-center p-1">
              Sin imagen
            </span>
          )}
        </div>
        <label className="text-sm text-purple-950 font-semibold cursor-pointer underline">
          Cambiar Imagen
          <input
            type="file"
            name="image_url"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      </div>
      {/* Nombre */}
      <div className="col-span-2">
        <label className="block text-sm font-medium">Nombre del Servicio</label>
        <input
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={`w-full border p-2 rounded ${errors.name ? "border-red-500" : ""}`}
        />
        {renderError("name")}
      </div>

      {/* Duración y Precio */}
      <div className="col-span-1">
        <label className="block text-sm font-medium">Duración (min)</label>
        <input
          type="number"
          name="duration_minutes"
          value={formData.duration_minutes}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />
        {renderError("duration_minutes")}
      </div>

      <div className="col-span-1">
        <label className="block text-sm font-medium">Precio</label>
        <input
          type="number"
          name="price"
          value={formData.price}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />
        {renderError("price")}
      </div>

      {/* Categoria Vinculado */}
      <div className="col-span-1">
        <label className="block text-sm font-medium text-gray-700">
          Seleccionar Categoría
        </label>
        <select
          name="category_id"
          value={formData.category_id}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        >
          <option value="">-- Seleccione una categoría --</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        {renderError("category_id")}
      </div>

      {/* Empleado Vinculado */}
      <div className="col-span-1">
        <label className="block text-sm font-medium text-gray-700">
          Seleccionar Empleado
        </label>
        <select
          name="employee_id"
          value={formData.employee_id}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        >
          <option value="">-- Seleccione un estilista --</option>
          {employees.map((employee) => (
            <option key={employee.id} value={employee.id}>
              {employee.name}
            </option>
          ))}
        </select>
        {renderError("employee_id")}
      </div>

      {/* Producto Vinculado */}
      <div className="col-span-2">
        <label className="block text-sm font-medium text-gray-700">
          Seleccionar Producto
        </label>
        <select
          name="products"
          multiple={true}
          value={formData.products.map((p) => p.id) || []}
          onChange={handleMultiSelectProducts}
          className="w-full border p-2 rounded"
        >
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name}
            </option>
          ))}
        </select>
        {renderError("product_id")}

        {/* Inputs dinámicos para ajustar la cantidad de cada producto elegido */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {formData.products.map((item, index) => {
            const productInfo = products.find((p) => p.id == item.id);
            return (
              <div key={item.id} className="flex items-center gap-2 mt-2">
                <span>
                  {productInfo ? productInfo.name : `Producto ID: ${item.id}`}
                </span>
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => {
                    const newQty = parseInt(e.target.value) || 1;
                    const updatedProducts = [...formData.products];
                    updatedProducts[index].quantity = newQty;
                    setFormData({ ...formData, products: updatedProducts });
                  }}
                  className="border p-1 w-20 rounded"
                  placeholder="Cant"
                />
                <button
                  type="button"
                  onClick={() => {
                    const updatedProducts = formData.products.filter(
                      (p) => Number(p.id) !== Number(item.id),
                    );
                    setFormData((prev) => ({
                      ...prev,
                      products: updatedProducts,
                    }));
                  }}
                  className="text-red-500 hover:text-red-700 px-2 font-bold"
                  title="Eliminar"
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Switch de Activo */}
      <div className="col-span-2 flex items-center justify-between bg-gray-50 p-3 rounded-lg border">
        <span className="font-medium text-gray-700">¿Servicio activo?</span>
        <button
          type="button"
          onClick={() =>
            setFormData((prev) => ({ ...prev, is_active: !prev.is_active }))
          }
          className={`${formData.is_active ? "bg-green-600" : "bg-gray-300"} relative inline-flex h-6 w-11 rounded-full transition-colors`}
        >
          <span
            className={`${formData.is_active ? "translate-x-6" : "translate-x-1"} inline-block h-4 w-4 mt-1 bg-white rounded-full transition-transform`}
          />
        </button>
      </div>
    </form>
    </Modal>
  );
};

export default ServiceForm;
