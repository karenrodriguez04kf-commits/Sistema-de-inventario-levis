import React, { useEffect, useState } from 'react';
import api, { BASE_URL } from './api';
import './ReporteVentas.css';

const ReporteVentas = () => {
    const [ventas, setVentas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [ventaAbierta, setVentaAbierta] = useState(null);

    useEffect(() => {
        const fetchVentas = async () => {
            try {
                const response = await api.get('/productos/ReporteVentas');
                const agrupadas = response.data.reduce((acc, venta) => {
                    if (!acc[venta.id_venta]) {
                        acc[venta.id_venta] = {
                            id: venta.id_venta,
                            fecha: venta.fecha,
                            total: venta.total_venta,
                            usuario: venta.nombre_usuario,
                            email: venta.email_usuario,
                            productos: []
                        };
                    }
                    acc[venta.id_venta].productos.push(venta);
                    return acc;
                }, {});
                setVentas(agrupadas);
            } catch (err) {
                console.error("Error al cargar reporte:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchVentas();
    }, []);

    if (loading) return <div className="rv-loading">Cargando reporte de ventas...</div>;

    const ventasArray = Object.values(ventas).sort((a, b) => b.id - a.id);

    return (
        <div className="rv-container">
            <div className="rv-header">
                <h2 className="rv-titulo">REPORTE DE VENTAS</h2>
                <span className="rv-count">{ventasArray.length} ventas registradas</span>
            </div>

            {ventasArray.length === 0 ? (
                <p className="rv-vacio">No se han registrado ventas aún.</p>
            ) : (
                <div className="rv-lista">
                    {ventasArray.map(venta => (
                        <div key={venta.id} className="rv-card">
                            <div
                                className={`rv-card-header ${ventaAbierta === venta.id ? 'abierto' : ''}`}
                                onClick={() => setVentaAbierta(ventaAbierta === venta.id ? null : venta.id)}
                            >
                                <div className="rv-venta-id">#{venta.id}</div>
                                <div className="rv-venta-usuario">
                                    <div className="rv-avatar">{venta.usuario.charAt(0).toUpperCase()}</div>
                                    <div className="rv-usuario-info">
                                        <span className="rv-nombre">{venta.usuario}</span>
                                        <span className="rv-email">{venta.email}</span>
                                    </div>
                                </div>
                                <div className="rv-venta-meta">
                                    <span className="rv-fecha">{new Date(venta.fecha).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                    <span className="rv-productos-count">{venta.productos.length} producto(s)</span>
                                </div>
                                <div className="rv-total">${Number(venta.total).toLocaleString()} COP</div>
                                <div className="rv-chevron">{ventaAbierta === venta.id ? '▲' : '▼'}</div>
                            </div>

                            {ventaAbierta === venta.id && (
                                <div className="rv-productos">
                                    {venta.productos.map((prod, i) => (
                                        <div key={i} className="rv-producto">
                                            <img
                                                src={`${BASE_URL}${prod.imagen}`}
                                                alt={prod.nombreProducto}
                                                onError={e => e.target.src = "/img/placeholder.png"}
                                            />
                                            <div className="rv-producto-info">
                                                <span className="rv-producto-nombre">{prod.nombreProducto}</span>
                                                <span className="rv-producto-detalle">
                                                    Talla: <strong>{prod.talla || 'N/A'}</strong> | Cantidad: {prod.cantidad} × ${Number(prod.precioUnitario).toLocaleString()}
                                                </span>
                                            </div>
                                            <span className="rv-subtotal">${Number(prod.cantidad * prod.precioUnitario).toLocaleString()}</span>
                                        </div>
                                    ))}
                                    <div className="rv-total-detalle">
                                        <span>Total de la venta</span>
                                        <strong>${Number(venta.total).toLocaleString()} COP</strong>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ReporteVentas;