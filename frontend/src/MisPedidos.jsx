import React, { useState, useEffect } from 'react';
import api from './api'; 
import { jwtDecode } from "jwt-decode";
import './MisPedidos.css';

const MisPedidos = () => {
    const [pedidosAgrupados, setPedidosAgrupados] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPedidos = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;

            try {
                const decoded = jwtDecode(token);
                const id_usuario = decoded.id_usuario || decoded.id;
                const response = await api.get(`/productos/mis-pedidos/${id_usuario}`);
                
                // ✅ Agrupación por id_venta
                const agrupados = response.data.reduce((acc, item) => {
                    if (!acc[item.id_venta]) {
                        acc[item.id_venta] = {
                            id: item.id_venta,
                            fecha: item.fecha,
                            totalPedido: item.total,
                            productos: []
                        };
                    }
                    acc[item.id_venta].productos.push(item);
                    return acc;
                }, {});

                setPedidosAgrupados(agrupados);
            } catch (error) {
                console.error("Error al cargar pedidos:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPedidos();
    }, []);

    if (loading) return <div className="loader-pedidos">Consultando historial...</div>;

    return (
        <div className="pedidos-history-container">
            <div className="history-header">
                <h2>Mis Compras Realizadas 🛍️</h2>
                <button onClick={() => window.location.href='/home/catalogo'} className="btn-return">
                    ← Volver a la Tienda
                </button>
            </div>

            {Object.keys(pedidosAgrupados).length === 0 ? (
                <div className="empty-history">No tienes pedidos registrados aún.</div>
            ) : (
                <div className="pedidos-list">
                    {Object.values(pedidosAgrupados).sort((a,b) => b.id - a.id).map((pedido) => (
                        <div key={pedido.id} className="pedido-group-card">
                            <div className="pedido-group-header">
                                <div className="header-info">
                                    <span className="order-number">PEDIDO #{pedido.id}</span>
                                    <span className="order-date">🗓️ {new Date(pedido.fecha).toLocaleDateString()}</span>
                                </div>
                                <div className="order-total-badge">
                                    TOTAL: ${Number(pedido.totalPedido).toLocaleString()} COP
                                </div>
                            </div>

                            <div className="pedido-items-list">
                                {pedido.productos.map((prod, idx) => (
                                    <div key={idx} className="pedido-item-row">
                                        <img 
                                            src={`http://localhost:3002${prod.imagen}`} 
                                            alt={prod.nombreProducto} 
                                            className="item-mini-img"
                                        />
                                        <div className="item-info">
                                            <p className="item-name">{prod.nombreProducto}</p>
                                            <p className="item-qty">
                                                Cant: {prod.cantidad} x ${Number(prod.precioUnitario).toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="item-subtotal">
                                            ${Number(prod.cantidad * prod.precioUnitario).toLocaleString()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="pedido-group-footer">
                                <span className="status-label">ESTADO: ENTREGADO</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MisPedidos;