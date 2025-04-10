import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import logitoooo from './../../img/LogoCompleto.png';

const Star = ({ marked, starId }) => (
  <span
    data-star-id={starId}
    className="star"
    role="button"
    style={{
      color: marked ? "#FFD700" : "#C5C5C5",
      fontSize: "4rem",  // Ajuste para que las estrellas no sean demasiado grandes
      cursor: "pointer",
      marginRight: "4px",
      transition: "color 0.2s ease-in-out"
    }}
  >
    {marked ? "\u2605" : "\u2606"}
  </span>
);

const StarRating = ({ value, editable = false, onChange = () => {} }) => {
  const [rating, setRating] = useState(parseInt(value) || 0);
  const [selection, setSelection] = useState(0);

  useEffect(() => {
    setRating(parseInt(value) || 0);
  }, [value]);

  const hoverOver = (event) => {
    if (!editable) return;
    let val = 0;
    if (event?.target?.getAttribute("data-star-id"))
      val = parseInt(event.target.getAttribute("data-star-id"));
    setSelection(val);
  };

  const handleClick = (e) => {
    if (!editable) return;
    const newRating = parseInt(e.target.getAttribute("data-star-id") || rating);
    setRating(newRating);
    onChange(newRating);
  };

  return (
    <div
      className="star-rating"
      onMouseLeave={() => hoverOver(null)}
      onMouseOver={hoverOver}
      onClick={handleClick}
      aria-label={`Calificación: ${rating} de 5 estrellas`}
    >
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          starId={i + 1}
          key={`star_${i + 1}`}
          marked={selection ? selection >= i + 1 : rating >= i + 1}
        />
      ))}
    </div>
  );
};

export default function Reseña() {
  const { register, handleSubmit, reset } = useForm();
  const [rating, setRating] = useState(0);
  const [searchParams] = useSearchParams();
  const empleadoId = searchParams.get("empleadoId");
  const mesaId = searchParams.get("mesaId");

  const onSubmit = async (data) => {
    if (!empleadoId || !mesaId) {
      alert("Faltan datos necesarios para enviar la reseña.");
      return;
    }

    const resena = {
      comentario: data.comentario,
      puntuacion: rating,
      empleado: { id: empleadoId },
      mesa: { id: mesaId }
    };

    console.log("Reseña a enviar:", resena);
    
    try {
      const response = await axios.post("http://localhost:8080/api/resena", resena);
      console.log("Reseña guardada:", response.data);
      alert("¡Gracias por tu reseña!");
      reset();
      setRating(0);
    } catch (error) {
      console.error("Error al guardar la reseña:", error);
      alert("Ocurrió un error al enviar tu reseña.");
    }
  };

  return (
    <div className="vh-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: "#9B1C31" }}>
      <div className="container bg-white rounded p-3 p-md-4">
        <h3 className="text-center mb-4">¡Tu opinión es importante para nosotros!</h3>
        <p className="text-center">
          Queremos brindarte siempre el mejor servicio, y tu experiencia nos ayuda a mejorar. 
          ¿Cómo fue la atención de nuestro equipo? <br />Déjanos tu reseña sobre nuestros camareros y cuéntanos qué te pareció su servicio. 
          <br />¡Agradecemos tu tiempo y esperamos verte pronto! 😊
        </p>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-3">
            <textarea
              id="comentario"
              placeholder="¡Comparte tu opinión!"
              {...register("comentario", { required: true })}
              className="form-control"
              rows={4}
            />
          </div>
          <div className="mb-3 text-center">
            <StarRating value={rating} editable={true} onChange={setRating} />
          </div>
          <div className="text-center">
            <button type="submit" className="btn btn-danger">Finalizar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
