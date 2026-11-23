import React, { useState } from "react";
import PhoneInput from "./PhoneInput";

// Componente auxiliar para el mensaje de error
const ErrorMessage = ({ message }) => (
  <span className="text-red-500 text-xs mt-1 block ml-1">{message}</span>
);

const BusinessForm = ({
  initialData,
  onSubmit,
  title,
  isEditable = true,
  errors = {},
}) => {
  const [formData, setFormData] = useState(initialData);
  const [preview, setPreview] = useState(initialData.logo || null);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "logo") {
      const file = files[0];
      setFormData({ ...formData, logo: file });
      setPreview(URL.createObjectURL(file));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      if (formData[key] === null || formData[key] === undefined) {
        return;
      }
      if (key === "logo") {
        if (formData.logo instanceof File) {
          data.append("logo", formData.logo);
        }
        return;
      }
      const val = formData[key];
      if (typeof val === "string" && val.trim() === "") {
        return;
      }
      data.append(key, val);
    });

    onSubmit(data);
  };
  return (
    <div className="w-full max-w-lg bg-white p-8 rounded-3xl shadow-xl mx-auto">
      <h2 className="text-2xl font-bold text-purple-950 mb-6 text-center">
        {title}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col items-center mb-6">
          <div className="w-24 h-24 rounded-full border-4 border-purple-100 overflow-hidden mb-2 bg-gray-100 flex items-center justify-center">
            <img
              src={
                formData.logo instanceof File
                  ? URL.createObjectURL(formData.logo)
                  : formData.logo &&
                      typeof formData.logo === "string" &&
                      formData.logo.trim() !== "" &&
                      !formData.logo.startsWith("http")
                    ? `${import.meta.env.VITE_API_URL ?? ""}/storage/${formData.logo}`
                    : formData.logo && typeof formData.logo === "string" && formData.logo.trim() !== ""
                      ? formData.logo
                      : undefined
              }
              className="w-full h-full object-cover"
              style={{
                display:
                  (formData.logo instanceof File) ||
                  (formData.logo && typeof formData.logo === "string" && formData.logo.trim() !== "")
                    ? "block"
                    : "none",
              }}
              alt="Logo"
            />
          </div>
          <label className="text-sm text-purple-950 font-semibold cursor-pointer underline">
            Cambiar logo
            <input
              type="file"
              name="logo"
              onChange={handleChange}
              className="hidden"
            />
          </label>
        </div>

        {/* Campos con renderizado de errores condicional */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase ml-1">
            Nombre
          </label>
          <input
            name="name"
            value={formData.name ?? ""}
            disabled={!isEditable}
            onChange={handleChange}
            className={`w-full p-3 border rounded-xl ${!isEditable ? "bg-gray-100 cursor-not-allowed" : ""}`}
          />
          {errors.name && <ErrorMessage message={errors.name[0]} />}
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase ml-1">
            Tipo
          </label>
          <select
            name="type"
            value={formData.type || ""}
            disabled={!isEditable}
            onChange={handleChange}
            className={`w-full p-3 border rounded-xl bg-white ${!isEditable ? "bg-gray-100 cursor-not-allowed" : ""}`}
          >
            <option value="">-- Seleccione el tipo --</option>
            <option value="salon">Salón de Belleza</option>
            <option value="independent">Estilista Independiente</option>
          </select>
          {errors.type && <ErrorMessage message={errors.type[0]} />}
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase ml-1">
            Modalidad
          </label>
          <select
            name="modality"
            value={formData.modality || ""}
            disabled={!isEditable}
            onChange={handleChange}
            className={`w-full p-3 border rounded-xl bg-white ${!isEditable ? "bg-gray-100 cursor-not-allowed" : ""}`}
          >
            <option value="">-- Seleccione la modalidad --</option>
            <option value="local">Presencial</option>
            <option value="domicilio">A domicilio</option>
            <option value="hibrido">Mixto</option>
          </select>
          {errors.modality && <ErrorMessage message={errors.modality[0]} />}
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase ml-1">
            Descripcion
          </label>
          <textarea
            name="description"
            placeholder="Descripción"
            value={formData.description || ""}
            onChange={handleChange}
            className="w-full p-3 border rounded-xl"
          />
          {errors.description && (
            <ErrorMessage message={errors.description[0]} />
          )}
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase ml-1">
            Direccion
          </label>
          <input
            name="address"
            placeholder="Dirección"
            value={formData.address ?? ""}
            onChange={handleChange}
            className="w-full p-3 border rounded-xl"
          />
          {errors.address && <ErrorMessage message={errors.address[0]} />}
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase ml-1">
            Telefono
          </label>
          <PhoneInput
            name="phone"
            value={formData.phone}
            onChange={(val) => setFormData({ ...formData, phone: val })}
            invalid={!!errors.phone}
          />
          {errors.phone && <ErrorMessage message={errors.phone[0]} />}
        </div>

        <button
          type="submit"
          className="w-full bg-purple-950 text-white font-bold py-3 rounded-xl hover:bg-purple-900 transition"
        >
          Guardar Información
        </button>
      </form>
    </div>
  );
};

export default BusinessForm;
