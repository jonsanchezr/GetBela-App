import React, { useState, useEffect, useId } from "react";
import Modal from "../Modal";
import { apiUrl } from "../../api/apiUrl";

const BannersForm = ({ isOpen, onClose, onSubmit, initialData, editingId }) => {
  const [formData, setFormData] = useState({
    link: "",
    image: null,
  });
  const [preview, setPreview] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const formId = "banner-form-" + useId().replace(/[^a-zA-Z0-9]/g, "");

  useEffect(() => {
    if (initialData) {
      setFormData({
        link: initialData.link || "",
        image: null,
      });
      setPreview(
        initialData.image?.startsWith("http")
          ? initialData.image
          : initialData.image?.startsWith("/storage/")
          ? apiUrl(`${initialData.image}`)
          : initialData.image
      );
    } else {
      setFormData({ link: "", image: null });
      setPreview(null);
    }
    setValidationErrors({});
  }, [initialData, isOpen]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = await onSubmit(formData);
    if (errors) {
      setValidationErrors(errors);
    } else {
      setValidationErrors({});
    }
  };

  const handleClose = () => {
    setValidationErrors({});
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={editingId ? "Editar Banner" : "Nuevo Banner"}
      formId={formId}
      submitLabel={editingId ? "Actualizar" : "Crear"}
      maxWidth="max-w-lg"
    >
      <form id={formId} onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Imagen {editingId ? "" : "*"}
          </label>
          <input
            type="file"
            accept="image/jpeg,image/png,image/jpg,image/webp"
            onChange={handleFileChange}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 ${
              validationErrors.image ? "border-red-500" : "border-gray-300"
            }`}
          />
          <p className="text-xs text-gray-500 mt-1">
            Formatos: JPG, PNG, WEBP. Máx. 2MB
          </p>
          {validationErrors.image &&
            validationErrors.image.map((error, index) => (
              <p key={index} className="text-sm text-red-600 mt-1">
                {error}
              </p>
            ))}
        </div>

        {preview && (
          <div className="mt-2">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Vista previa
            </p>
            <img
              src={preview}
              alt="Preview"
              className="w-full h-40 object-cover rounded-lg border border-gray-200"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Enlace (Link)
          </label>
          <input
            type="url"
            value={formData.link}
            onChange={(e) => setFormData({ ...formData, link: e.target.value })}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
              validationErrors.link ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="https://ejemplo.com"
          />
          <p className="text-xs text-gray-500 mt-1">
            Opcional. Si se agrega, el banner será clicable
          </p>
          {validationErrors.link &&
            validationErrors.link.map((error, index) => (
              <p key={index} className="text-sm text-red-600 mt-1">
                {error}
              </p>
            ))}
        </div>
      </form>
    </Modal>
  );
};

export default BannersForm;
