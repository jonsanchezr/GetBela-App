import React, { useState, useEffect } from "react";
import api from "../../api/axios";
import { apiUrl } from "../../api/apiUrl";
import MainLayout from "../../layouts/MainLayout";
import { Sparkles, Scissors, Eye, Palette, Smile, HeartPulse } from "lucide-react";
import { useSearch } from "../../context/SearchContext";
import { Link } from "react-router-dom";
import ServiceCard from "../../components/public/ServiceCard";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const HomeCatalog = () => {
  const { searchQuery } = useSearch();
  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Cargar Banners y Categorías al montar el componente
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [bannerRes, catRes] = await Promise.all([
          api.get("/api/public/banners"),
          api.get("/api/public/categories")
        ]);
        
        setBanners(bannerRes.data.banners || []);
        setCategories(catRes.data.categories || []);
      } catch (error) {
        console.error("Error al cargar datos iniciales de la vista pública", error);
      }
    };

    fetchInitialData();
  }, []);

  // 2. Obtener servicios automáticamente cada vez que cambie la categoría o el buscador global
  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        let url = "/api/public/services?";
        if (selectedCategory) url += `category_id=${selectedCategory}&`;
        if (searchQuery) url += `search=${encodeURIComponent(searchQuery)}`;

        const response = await api.get(url);
        setServices(response.data.services || []);
      } catch (error) {
        console.error("Error al cargar los servicios", error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [selectedCategory, searchQuery]);

  // Manejar el clic en una tarjeta de categoría (Filtro)
  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(selectedCategory === categoryId ? null : categoryId);
  };

  // Función para retornar el icono correspondiente según el slug o nombre
  const getCategoryIcon = (slug) => {
    const s = slug.toLowerCase();
    if (s.includes("una") || s.includes("manicur")) return <Sparkles className="w-6 h-6" />;
    if (s.includes("ceja") || s.includes("pestana") || s.includes("pestaña")) return <Eye className="w-6 h-6" />;
    if (s.includes("cabello") || s.includes("pelo") || s.includes("corte")) return <Scissors className="w-6 h-6" />;
    if (s.includes("maquillaje") || s.includes("makeup")) return <Palette className="w-6 h-6" />;
    if (s.includes("depila")) return <Smile className="w-6 h-6" />;
    if (s.includes("facial") || s.includes("corporal") || s.includes("spa")) return <HeartPulse className="w-6 h-6" />;
    return <Sparkles className="w-6 h-6" />;
  };

  return (
    <MainLayout>
      {/* CARRUSEL DE BANNERS */}
      <section className="w-full bg-purple-900 relative">
        <div className="w-full h-64 md:h-130 overflow-hidden relative">
          {banners.length > 0 ? (
            <Swiper
              modules={[Autoplay, Pagination, Navigation]}
              spaceBetween={0}
              slidesPerView={1}
              loop={banners.length > 1}
              autoplay={banners.length > 1 ? { delay: 4000, disableOnInteraction: false } : false}
              pagination={banners.length > 1 ? { clickable: true } : false}
              navigation={banners.length > 1}
              speed={800}
              effect="slide"
              className="h-full w-full"
              lazy={{ enabled: true, loadPrevNext: true }}
            >
              {banners.map((banner) => {
                const imageSrc = banner.image?.startsWith('http')
                  ? banner.image
                  : banner.image?.startsWith('/storage/')
                    ? apiUrl(`${banner.image}`)
                    : banner.image;

                const slideContent = (
                  <img
                    src={imageSrc}
                    alt="Banner"
                    className="w-full h-full object-contain bg-purple"
                    loading="lazy"
                    decoding="async"
                  />
                );

                return (
                  <SwiperSlide key={banner.id}>
                    {banner.link ? (
                      <a
                        href={banner.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full h-full relative"
                      >
                        {slideContent}
                      </a>
                    ) : (
                      <div className="w-full h-full relative">
                        {slideContent}
                      </div>
                    )}
                  </SwiperSlide>
                );
              })}
            </Swiper>
          ) : (
            <div className="h-full flex items-center justify-center text-purple-200 text-center p-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold">Reserva tu estilo con los mejores profesionales</h2>
                <p className="text-sm mt-2 text-purple-300">Salones y estilistas independientes a un solo clic</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CONTENIDO PRINCIPAL */}
      <main className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full">
        
        {/* TARJETAS DE CATEGORÍAS */}
        <section className="mb-10">
          <h3 className="text-lg font-bold text-purple-950 mb-4">Explora por Categorías</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {categories.map((category) => {
              const isSelected = selectedCategory === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category.id)}
                  className={`p-4 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-2 shadow-sm ${
                    isSelected 
                      ? "bg-purple-950 text-white border-purple-950 scale-105 shadow-md" 
                      : "bg-white text-purple-950 border-purple-200 hover:border-purple-950 hover:shadow-md"
                  }`}
                >
                  <div className={isSelected ? "text-white" : "text-purple-950"}>
                    {getCategoryIcon(category.slug || category.name)}
                  </div>
                  <span className="text-sm font-bold">{category.name}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* LISTADO DE SERVICIOS */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-purple-950">
              {selectedCategory 
                ? `Servicios de: ${categories.find(c => c.id === selectedCategory)?.name || 'Categoría'}` 
                : "Todos los Servicios Disponibles"}
            </h3>
            <span className="text-sm text-gray-500">{services.length} resultados</span>
          </div>

          {loading ? (
            <div className="text-center py-20 text-gray-500">Cargando servicios...</div>
          ) : services.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl border p-8">
              <p className="text-gray-500 text-lg">No encontramos servicios disponibles con estos criterios.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {services.map((service) => (
                <ServiceCard
                  key={service.id || service.slug || `${service.name}-${service.business?.id || "no-business"}`}
                  service={service}
                  businessName={service.business?.name || "Negocio"}
                />
              ))}
            </div>
          )}
        </section>

      </main>
    </MainLayout>
  );
};

export default HomeCatalog;