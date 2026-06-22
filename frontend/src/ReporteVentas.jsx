import React, { useEffect, useState } from 'react';
import api, { BASE_URL } from './api';
import { useNavigate, Link } from 'react-router-dom';
import './ReporteVentas.css';


const ReporteVentas = () => {
    const [ventas, setVentas] = useState([]);
    const [loading, setLoading] = useState(false);
useEffect(() => {
        const fetchVentas = async () => {
            try{

                const response=await api.get('/productos/ReporteVentas');

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


if(loading) {
        return <div className="loading">Cargando reporte de ventas...</div>;
    }
    const ventasArray = Object.values(ventas).sort((a, b) => b.id - a.id);
return (
        <div className="reporte-container">
            <h2 className="reporte-titulo">REPORTE DE VENTAS</h2>
            
            {ventasArray.length === 0 ? (
                <p className="reporte-vacio">No se han registrado ventas aún.</p>
            ) : (
                <table className="reporte-table">
                    <thead>
                        <tr>
                            <th>ID Venta</th>
                            <th>Fecha</th>
                            <th>Total</th>
                            <th>Usuario</th>
                            <th>Email</th>
                            <th>Productos</th>
                        </tr>
                    </thead>    
                    <tbody>
                        {ventasArray.map(venta => (
                     <tr key={venta.id}>
                                <td>{venta.id}</td>
                                <td>{new Date(venta.fecha).toLocaleDateString()}</td>
                                <td>${Number(venta.total).toLocaleString()} COP</td>
                                <td>{venta.usuario}</td>
                                <td>{venta.email}</td>
                                          <td>
                                    <ul>
                                        {venta.productos.map((prod, index) => (
                                            <li key={index}>
                                                <img
                                                    src={`${BASE_URL}${prod.imagen}`}
                                                    alt={prod.nombreProducto}
                                                    style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', marginRight: '8px' }}
                                                    onError={(e) => { e.target.src = "/img/placeholder.png"; }}
                                                />
                                                {prod.nombreProducto} x {prod.cantidad} — ${Number(prod.precioUnitario).toLocaleString()}
                                            </li>
                                        ))}
                                    </ul>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};


export default ReporteVentas;