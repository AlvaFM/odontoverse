import { toast, Toaster } from "react-hot-toast";

// Importa tus íconos específicos
import DienteEspejo from "../assets/img/dienteespejo.png";
import DienteLike from "../assets/img/dientelike.png";
import DienteDuda from "../assets/img/dienteduda.png";

export const Notify: React.FC = () => {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 3500,
        style: {
          background: "#D6E6F2", // celeste pastel
          color: "#034C7D",      // gris oscuro
          border: "1px solid #B0CDE8",
          borderRadius: "16px",
          padding: "14px 20px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
        },
      }}
    />
  );
};

// Funciones de notificación global
export const notify = {
  info: (msg: string) =>
    toast(msg, {
      icon: <img src={DienteEspejo} className="h-6 w-6" />,
    }),
  success: (msg: string) =>
    toast.success(msg, {
      icon: <img src={DienteLike} className="h-6 w-6" />,
    }),
  error: (msg: string) =>
    toast.error(msg, {
      icon: <img src={DienteDuda} className="h-6 w-6" />,
    }),
};
