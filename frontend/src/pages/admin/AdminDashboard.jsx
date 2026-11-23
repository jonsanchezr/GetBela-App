import React, { useCallback, useEffect, useState } from "react";
import api from "../../api/axios";
import { apiUrl } from "../../api/apiUrl";
import {
  Building2,
  CalendarCheck,
  Users,
  UserCog,
  ShieldCheck,
  ShieldOff,
  Search,
  ChevronDown,
  ChevronRight,
  Loader2,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  XCircle,
} from "lucide-react";

const PERIODS = [
  { key: "today", label: "Hoy" },
  { key: "week", label: "Semana" },
  { key: "month", label: "Mes" },
];

const KpiCard = ({ icon: Icon, label, value, hint, accent = "purple" }) => {
  const accents = {
    purple: "bg-purple-100 text-purple-800",
    green: "bg-green-100 text-green-700",
    red: "bg-red-100 text-red-600",
    amber: "bg-amber-100 text-amber-700",
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-start gap-4">
      <div className={`p-3 rounded-xl ${accents[accent]}`}>
        <Icon size={22} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          {label}
        </p>
        <p className="text-2xl font-bold text-purple-950 leading-tight">
          {value}
        </p>
        {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
      </div>
    </div>
  );
};

const BusinessLogo = ({ business }) => {
  const [failed, setFailed] = useState(false);

  if (business.logo && !failed) {
    return (
      <img
        src={apiUrl(`/storage/${business.logo}`)}
        alt={business.name}
        className="w-10 h-10 rounded-full object-cover border border-gray-200"
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
      {business.name?.charAt(0)?.toUpperCase() || "?"}
    </div>
  );
};

const AdminDashboard = () => {
  const [period, setPeriod] = useState("today");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  // Debounce del buscador para no consultar en cada tecla.
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/api/admin/dashboard", {
        params: { period, search: debouncedSearch },
      });
      setData(res.data);
    } catch (err) {
      console.error("Error al cargar el panel admin:", err);
      setError("No se pudo cargar el panel. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }, [period, debouncedSearch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleAccess = async (business) => {
    const nextState = !business.is_active;

    const question = nextState
      ? `¿Reactivar el acceso de "${business.name}"?`
      : `¿Suspender el acceso de "${business.name}"?\n\nSe bloqueará el acceso a la plataforma para el negocio y todos sus usuarios, y sus servicios se ocultarán del catálogo público.`;

    if (!window.confirm(question)) return;

    setUpdatingId(business.id);

    // Actualización optimista del switch.
    setData((prev) =>
      prev
        ? {
            ...prev,
            businesses: prev.businesses.map((b) =>
              b.id === business.id
                ? {
                    ...b,
                    is_active: nextState,
                    suspended_at: nextState ? null : new Date().toISOString(),
                  }
                : b,
            ),
          }
        : prev,
    );

    try {
      await api.patch(`/api/admin/businesses/${business.id}/access`, {
        is_active: nextState,
      });
      // Refrescamos para actualizar los totales activos/suspendidos.
      await fetchData();
    } catch (err) {
      console.error("Error al cambiar el acceso:", err);
      setError("No se pudo actualizar el acceso del negocio.");
      await fetchData();
    } finally {
      setUpdatingId(null);
    }
  };

  const totals = data?.totals;

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-purple-950">
            Panel de Administración
          </h1>
          <p className="text-sm text-gray-500">
            Negocios registrados en GetBela y su actividad.
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Actualizar
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <KpiCard
          icon={Building2}
          label="Negocios"
          value={totals?.businesses ?? "—"}
          hint={`${totals?.active_businesses ?? 0} activos · ${totals?.suspended_businesses ?? 0} suspendidos`}
          accent="purple"
        />
        <KpiCard
          icon={CalendarCheck}
          label="Citas completadas"
          value={totals?.completed_appointments ?? "—"}
          hint={data?.period?.label}
          accent="green"
        />
        <KpiCard
          icon={Users}
          label="Usuarios"
          value={totals?.users ?? "—"}
          hint={`${totals?.owners ?? 0} dueños de negocio`}
          accent="amber"
        />
        <KpiCard
          icon={UserCog}
          label="Empleados"
          value={totals?.employees ?? "—"}
          hint={`${totals?.employees_with_access ?? 0} con acceso · ${totals?.employees_without_access ?? 0} sin acceso`}
          accent="purple"
        />
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="inline-flex rounded-xl bg-gray-100 p-1">
          {PERIODS.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                period === p.key
                  ? "bg-purple-950 text-white shadow"
                  : "text-gray-600 hover:text-purple-900"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar negocio…"
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-purple-900"
          />
        </div>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Tabla */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading && !data ? (
          <div className="py-16 flex flex-col items-center text-gray-400">
            <Loader2 size={28} className="animate-spin mb-3" />
            Cargando panel…
          </div>
        ) : data?.businesses?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wide">
                <tr>
                  <th className="text-left font-semibold px-4 py-3">Negocio</th>
                  <th className="text-left font-semibold px-4 py-3">Dueño</th>
                  <th className="text-center font-semibold px-4 py-3">
                    Citas completadas
                  </th>
                  <th className="text-left font-semibold px-4 py-3">
                    Empleados
                  </th>
                  <th className="text-center font-semibold px-4 py-3">Acceso</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.businesses.map((business) => {
                  const isExpanded = expandedId === business.id;
                  const isUpdating = updatingId === business.id;

                  return (
                    <React.Fragment key={business.id}>
                      <tr className="hover:bg-gray-50/70">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <BusinessLogo business={business} />
                            <div className="min-w-0">
                              <p className="font-semibold text-purple-950 truncate">
                                {business.name}
                              </p>
                              <p className="text-xs text-gray-400">
                                Alta:{" "}
                                {business.created_at
                                  ? new Date(
                                      business.created_at,
                                    ).toLocaleDateString("es-VE")
                                  : "—"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          {business.owner ? (
                            <div className="min-w-0">
                              <p className="text-gray-800 truncate">
                                {business.owner.name}
                              </p>
                              <p className="text-xs text-gray-400 truncate">
                                {business.owner.email}
                              </p>
                            </div>
                          ) : (
                            <span className="text-xs italic text-gray-400">
                              Sin dueño
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center justify-center min-w-9 px-2 py-1 rounded-lg bg-purple-50 text-purple-900 font-bold">
                            {business.completed_appointments}
                          </span>
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1.5">
                            <span className="inline-flex items-center gap-1 rounded-full bg-green-50 text-green-700 px-2 py-0.5 text-xs font-medium">
                              <CheckCircle2 size={12} />
                              Con acceso: {business.employees_with_access}
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 text-gray-600 px-2 py-0.5 text-xs font-medium">
                              <XCircle size={12} />
                              Sin acceso: {business.employees_without_access}
                            </span>
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex flex-col items-center gap-1">
                            <button
                              type="button"
                              role="switch"
                              aria-checked={business.is_active}
                              aria-label={`Acceso de ${business.name}`}
                              onClick={() => toggleAccess(business)}
                              disabled={isUpdating}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-60 ${
                                business.is_active
                                  ? "bg-green-500"
                                  : "bg-gray-300"
                              }`}
                            >
                              <span
                                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                                  business.is_active
                                    ? "translate-x-5"
                                    : "translate-x-0.5"
                                }`}
                              />
                            </button>
                            <span
                              className={`text-[11px] font-medium ${
                                business.is_active
                                  ? "text-green-700"
                                  : "text-red-500"
                              }`}
                            >
                              {isUpdating
                                ? "Guardando…"
                                : business.is_active
                                  ? "Activo"
                                  : "Suspendido"}
                            </span>
                          </div>
                        </td>

                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedId(isExpanded ? null : business.id)
                            }
                            className="p-2 rounded-lg text-gray-400 hover:text-purple-900 hover:bg-purple-50"
                            aria-label="Ver empleados"
                          >
                            {isExpanded ? (
                              <ChevronDown size={18} />
                            ) : (
                              <ChevronRight size={18} />
                            )}
                          </button>
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr className="bg-gray-50/60">
                          <td colSpan={6} className="px-4 py-4">
                            <div className="flex items-center justify-between mb-3">
                              <h3 className="text-sm font-semibold text-purple-950 flex items-center gap-2">
                                <UserCog size={16} />
                                Empleados de {business.name}
                              </h3>
                              <span className="text-xs text-gray-500">
                                {business.employees_total} en total
                              </span>
                            </div>

                            {business.employees?.length ? (
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                {business.employees.map((employee) => (
                                  <div
                                    key={employee.id}
                                    className="flex items-center justify-between gap-3 rounded-xl bg-white border border-gray-100 px-3 py-2"
                                  >
                                    <div className="min-w-0">
                                      <p className="text-sm font-medium text-gray-800 truncate">
                                        {employee.name}
                                      </p>
                                      <p className="text-xs text-gray-400 truncate">
                                        {employee.specialty || "Sin especialidad"}
                                        {employee.is_active
                                          ? ""
                                          : " · inactivo"}
                                      </p>
                                    </div>
                                    {employee.has_access ? (
                                      <span className="inline-flex items-center gap-1 rounded-full bg-green-50 text-green-700 px-2 py-0.5 text-[11px] font-medium shrink-0">
                                        <ShieldCheck size={12} />
                                        Con acceso
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 text-gray-500 px-2 py-0.5 text-[11px] font-medium shrink-0">
                                        <ShieldOff size={12} />
                                        Sin acceso
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm italic text-gray-400">
                                Este negocio no tiene empleados registrados.
                              </p>
                            )}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-gray-400">
            <Building2 size={32} className="mx-auto mb-3 opacity-50" />
            <p className="text-sm">
              No hay negocios que coincidan con la búsqueda.
            </p>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400 mt-4">
        Suspender un negocio bloquea el acceso de todos sus usuarios y oculta
        sus servicios del catálogo público. Las citas existentes no se eliminan.
      </p>
    </div>
  );
};

export default AdminDashboard;
