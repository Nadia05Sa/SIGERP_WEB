import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import * as yup from 'yup';
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import logoCompleto from './../img/LogoCompleto.png';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

export default function Form() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [loginError, setLoginError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    

    // Invalidar el token al cargar el componente
    useEffect(() => {
        localStorage.removeItem('authToken'); // Elimina el token
        localStorage.removeItem('refreshToken'); // Opcional: elimina el refresh token si lo usas
    }, []);

    const schema = yup.object().shape({
        email: yup.string().required("Ingresa un email").email("Ingresa un email válido"),
        password: yup.string().required("Ingresa una contraseña").min(4, "Mínimo 4 caracteres"),
    });

    const { register, handleSubmit, formState: { errors } } = useForm({ resolver: yupResolver(schema) });

    async function onSubmit(data) {
        setIsLoading(true);
        setLoginError('');

        try {
            // API call to login endpoint
            const response = await axios.post('https://gmm0ermcb9.execute-api.us-east-1.amazonaws.com/auth/login', {
                username: data.email,
                password: data.password
            }, {
                headers: { 
                    'Content-Type': 'application/json'
                }
            });

            // Store token in localStorage for future API calls
            localStorage.setItem('authToken', response.data.token);

            // Set token as default Authorization header for future requests
            axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;

            // Navigate to home page after successful login
            navigate('/home');

        } catch (error) {
            console.error("Login error:", error);
            setLoginError(error.response?.data?.message || 'Credenciales incorrectas');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="vh-100 d-flex align-items-center justify-content-center" style={{backgroundColor:'#9B1C31'}}>
            <div className="row text-light rounded shadow-lg overflow-hidden" style={{backgroundColor:'#FFF'}} >
                {/* Imagen */}
                <div className="col-md-6 p-4 d-flex align-items-center justify-content-center " style={{backgroundColor:'#FFF'}}>
                    <img src={logoCompleto} alt="SIGERM RESTAURANTE" className="img-fluid" style={{ maxWidth: '80%' }} />
                </div>
                
                {/* Formulario */}
                <div className="col-md-6 p-4">
                    <h3 className="text-center mb-4" style={{color:'#000'}}>SIGERM RESTAURANTE</h3>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="mb-3">
                            <label htmlFor="email" className="form-label" style={{color:'#000'}}>Correo:</label>
                            <input
                                id="email"
                                type="text"
                                placeholder="Correo"
                                {...register("email")}
                                className="form-control"
                            />
                            {errors.email && <div className="text-warning small">{errors.email.message}</div>}
                        </div>
                        <div className="mb-3">
                            <label htmlFor="password" className="form-label" style={{ color: '#000' }}>Contraseña:</label>
                            <div className="input-group">
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Contraseña"
                                {...register("password")}
                                className="form-control"
                            />
                            <button 
                                type="button" 
                                className="btn btn-outline-danger border-1"
                                style={{ borderColor: '#DDD' }}
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                            </div>
                            {errors.password && <div className="text-warning small">{errors.password.message}</div>}
                        </div>

                        {loginError && <div className="alert alert-danger">{loginError}</div>}
                        <button
                            type="submit"
                            className="btn btn-light w-100 fw-bold bg-danger text-light"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Cargando...' : 'Continuar'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}