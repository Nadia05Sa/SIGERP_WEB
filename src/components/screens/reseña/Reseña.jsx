import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import logitoooo from './../../img/LogoCompleto.png';

// Componente de estrella individual
const Star = ({ marked, starId }) => {
  return (
    <span
      data-star-id={starId}
      className="star"
      role="button"
      style={{
        color: marked ? "#FFD700" : "#C5C5C5",
        fontSize: "52px",
        cursor: "pointer",
        marginRight: "2px",
        transition: "color 0.2s ease-in-out"
      }}
    >
      {marked ? "\u2605" : "\u2606"}
    </span>
  );
};

// Componente de calificación por estrellas
const StarRating = ({ value, editable = false, onChange = () => {} }) => {
  const [rating, setRating] = useState(parseInt(value) || 0);
  const [selection, setSelection] = useState(0);

  useEffect(() => {
    setRating(parseInt(value) || 0);
  }, [value]);

  const hoverOver = (event) => {
    if (!editable) return;
    let val = 0;
    if (event && event.target && event.target.getAttribute("data-star-id"))
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
  const { register, handleSubmit } = useForm();
  const [rating, setRating] = useState(0);

  const onSubmit = (data) => {
    console.log({ comentario: data.comentario, rating });
  };

  return (
    <div className="vh-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: "#9B1C31" }}>
      <div className="container bg-white rounded p-4">
        <h2 className="text-center mb-4">¡Tu opinión es importante para nosotros!</h2>
        <p className="text-center">
          Queremos brindarte siempre el mejor servicio, y tu experiencia nos ayuda a mejorar. 
          ¿Cómo fue la atención de nuestro equipo? Déjanos tu reseña sobre nuestros camareros y cuéntanos qué te pareció su servicio. 
          ¡Agradecemos tu tiempo y esperamos verte pronto! 😊
        </p>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-3">
            <label htmlFor="comentario" className="form-label">Comentario</label>
            <textarea
              id="comentario"
              placeholder="¡Comparte tu opinión!"
              {...register("comentario")}
              className="form-control"
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