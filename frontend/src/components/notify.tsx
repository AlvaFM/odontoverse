import React from "react";
import { toast, Toaster, Toast } from "react-hot-toast";
import DienteEspejo from "../assets/img/dienteespejo.png";
import DienteLike from "../assets/img/dientelike.png";
import DienteDuda from "../assets/img/dienteduda.png";

interface CustomToastProps {
  message: string;
  imageSrc: string;
}

const CustomToast: React.FC<CustomToastProps> = ({ message, imageSrc }) => {
  return (
    <div className="flex justify-center">
      <div className="bg-[#D6E6F2] border border-[#B0CDE8] rounded-2xl p-6 flex flex-col items-center gap-4 shadow-xl w-72 sm:w-80">
        <img src={imageSrc} alt="icon" className="h-16 w-16 object-contain" />
        <span className="text-[#034C7D] font-semibold text-center text-sm sm:text-base">
          {message}
        </span>
      </div>
    </div>
  );
};

export const Notify: React.FC = () => (
  <Toaster position="top-center" />
);

export const notify = {
  info: (msg: string) =>
    toast.custom((t: Toast) => (
      <div className={`transform transition-all duration-300 ${t.visible ? "opacity-100 scale-100" : "opacity-0 scale-90"}`}>
        <CustomToast message={msg} imageSrc={DienteEspejo} />
      </div>
    )),
  success: (msg: string) =>
    toast.custom((t: Toast) => (
      <div className={`transform transition-all duration-300 ${t.visible ? "opacity-100 scale-100" : "opacity-0 scale-90"}`}>
        <CustomToast message={msg} imageSrc={DienteLike} />
      </div>
    )),
  error: (msg: string) =>
    toast.custom((t: Toast) => (
      <div className={`transform transition-all duration-300 ${t.visible ? "opacity-100 scale-100" : "opacity-0 scale-90"}`}>
        <CustomToast message={msg} imageSrc={DienteDuda} />
      </div>
    )),
};
