import React, { useState, useEffect } from 'react';
import api, { BASE_URL } from './api'; 
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { FaShoppingBag, FaCalendarAlt, FaArrowLeft, FaReceipt, FaBoxOpen } from "react-icons/fa";
import './MisPedidos.css';

const MisPedidos = () => {
    const [pedidosAgrupados, setPedidosAgrupados] = useState({});
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPedidos = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate("/login");
                return;
            }

            try {
                const decoded = jwtDecode(token);
                const id_usuario = decoded.id_usuario || decoded.id;
                const response = await api.get(`/productos/mis-pedidos/${id_usuario}`);
                
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
    }, [navigate]);

    if (loading) {
        return (
            <div className="catalogo-page neon-loader-container">
                <div className="neon-loader-text">CONSULTANDO HISTORIAL...</div>
            </div>
        );
    }

    return (
        <div className="catalogo-page pedidos-page-wrapper">
            <div className="history-header-neon">
                <div className="header-title-box">
                    <h2>Mis Compras Realizadas <FaShoppingBag className="icon-pulse" /></h2>
                    <p>Historial interactivo y seguimiento de tus pedidos en tiempo real.</p>
                </div>
                <button onClick={() => navigate('/home/catalogo')} className="btn-return-neon">
                    <FaArrowLeft /> Volver a la Tienda
                </button>
            </div>

            {Object.keys(pedidosAgrupados).length === 0 ? (
                <div className="empty-history-neon">
                    <FaReceipt size={50} className="empty-icon-glow" />
                    <p>No tienes pedidos registrados aún.</p>
                    <button onClick={() => navigate('/home/catalogo')} className="btn-explore-neon">
                        Explorar Catálogo
                    </button>
                </div>
            ) : (
                <div className="pedidos-grid-neon">
                    {Object.values(pedidosAgrupados).sort((a, b) => b.id - a.id).map((pedido) => (
                        <div key={pedido.id} className="pedido-card-neon">
                            <div className="card-neon-top">
                                <span className="order-tag">PEDIDO #{pedido.id}</span>
                                <span className="order-date-tag">
                                    <FaCalendarAlt /> {new Date(pedido.fecha).toLocaleDateString()}
                                </span>
                            </div>

                            <div className="card-neon-body">
                                {pedido.productos.map((prod, idx) => (
                                    <div key={idx} className="product-row-neon">
                                        <div className="img-container-neon">
                                            <img 
                                                src={prod.imagen ? `${BASE_URL}${prod.imagen}` : "/img/default.jpg"} 
                                                alt={prod.nombreProducto} 
                                                onError={(e) => { e.target.src = "/img/default.jpg"; }}
                                            />
                                        </div>
                                        <div className="product-info-neon">
                                            <h4>{prod.nombreProducto}</h4>
                                              <span className="prod-qty-price">
                                                 Cant: {prod.cantidad} {prod.talla ? `| Talla: ${prod.talla}` : ''} × ${Number(prod.precioUnitario).toLocaleString()}
                                                         </span>   
                                                    </div>
                                        <div className="product-subtotal-neon">
                                            ${Number(prod.cantidad * prod.precioUnitario).toLocaleString()}
                                        </div>
                                    </div>
                                ))} 
                            </div>

                            <div className="card-neon-footer">
                                <div className="status-neon-pill">
                                    <span className="dot-pulse"></span> ESTADO: ENTREGADO
                                </div>
                                <div className="total-neon-box">
                                    TOTAL: <span>${Number(pedido.totalPedido).toLocaleString()} COP</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MisPedidos;