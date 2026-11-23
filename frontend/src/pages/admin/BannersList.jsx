import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { apiUrl } from "../../api/apiUrl";
import { Plus, Pencil, Trash2, Image as ImageIcon } from "lucide-react";
import BannersForm from "../../components/admin/BannersForm";

const BannersList = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingData, setEditingData] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const fetchBanners = async () => {
    try {
      const res = await api.get("/api/admin/banners");
      setBanners(res.data.banners || []);
    } catch (error) {
      console.error("Error al cargar banners:", error);
      setErrorMsg("Error al cargar los banners");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleOpenModal = (banner = null) => {
    setErrorMsg("");
    setSuccessMsg("");
    if (banner) {
      setEditingId(banner.id);
      setEditingData(banner);
    } else {
      setEditingId(null);
      setEditingData(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setEditingData(null);
    setErrorMsg("");
  };

  const handleSubmit = async (formData) => {
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const data = new FormData();
      if (formData.link) data.append("link", formData.link);
      if (formData.image) data.append("image", formData.image);

      if (editingId) {
        await api.post(`/api/admin/banners/${editingId}?_method=PUT`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setSuccessMsg("Banner actualizado correctamente");
      } else {
        if (!formData.image) {
          setErrorMsg("La imagen es obligatoria");
          return { image: ["La imagen es obligatoria"] };
        }
        await api.post("/api/admin/banners", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setSuccessMsg("Banner creado correctamente");
      }
      fetchBanners();
      setTimeout(() => {
        handleCloseModal();
      }, 1000);
      return null;
    } catch (error) {
      if (error.response?.status === 422 && error.response?.data?.errors) {
        return error.response.data.errors;
      } else {
        setErrorMsg(
          error.response?.data?.message || "Error al guardar el banner"
        );
        return null;
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar este banner?")) {
      try {
        await api.delete(`/api/admin/banners/${id}`);
        setSuccessMsg("Banner eliminado correctamente");
        fetchBanners();
        setTimeout(() => setSuccessMsg(""), 2000);
      } catch (error) {
        setErrorMsg(
          error.response?.data?.message || "Error al eliminar el banner"
        );
        setTimeout(() => setErrorMsg(""), 2000);
      }
    }
  };

  return (
    <div className="max-w-6xl w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-extrabold text-purple-950">
          Gestión del Carrusel (Banners)
        </h1>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-purple-950 text-white px-4 py-2 rounded-lg hover:bg-purple-800 transition shadow-sm"
        >
          <Plus size={18} /> Nuevo Banner
        </button>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {errorMsg}
        </div>
      )}
      {successMsg && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
          {successMsg}
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-100">
        <table className="w-full text-left">
          <thead className="bg-purple-800 text-white">
            <tr>
              <th className="p-4">Imagen</th>
              <th className="p-4">Enlace (Link)</th>
              <th className="p-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan="3" className="text-center py-8 text-gray-500">
                  Cargando...
                </td>
              </tr>
            ) : banners.length === 0 ? (
              <tr>
                <td colSpan="3" className="text-center py-8 text-gray-500 italic">
                  No hay banners registrados
                </td>
              </tr>
            ) : (
              banners.map((banner) => {
                const imgSrc = banner.image?.startsWith("http")
                  ? banner.image
                  : banner.image?.startsWith("/storage/")
                  ? apiUrl(`${banner.image}`)
                  : banner.image;
                return (
                  <tr key={banner.id} className="hover:bg-gray-50">
                    <td className="p-4">
                      {imgSrc ? (
                        <img
                          src={imgSrc}
                          alt="Banner"
                          className="w-40 h-20 object-cover rounded border border-gray-200"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-40 h-20 bg-gray-100 rounded border border-gray-200 flex items-center justify-center text-gray-400">
                          <ImageIcon size={24} />
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-gray-600 break-all">
                      {banner.link || (
                        <span className="text-gray-400 italic">
                          Sin enlace
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-center flex justify-center gap-2">
                      <button
                        onClick={() => handleOpenModal(banner)}
                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition"
                        title="Editar"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(banner.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <BannersForm
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        initialData={editingData}
        editingId={editingId}
      />
    </div>
  );
};

export default BannersList;
