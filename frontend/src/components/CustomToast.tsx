import React from "react";
import toast, { Toast } from "react-hot-toast";

interface CustomToastProps {
  message: string;
  imageSrc?: string;
}

const CustomToast: React.FC<CustomToastProps> = ({ message, imageSrc }) => {
  return (
    <div className="flex justify-center">
      <div className="bg-[#D6E6F2] border border-gray-200 rounded-xl p-6 flex flex-col items-center gap-4 shadow-lg w-[300px]">
        {imageSrc && <img src={imageSrc} alt="icon" className="h-16 w-16 object-contain" />}
        <span className="text-gray-800 font-semibold text-center">{message}</span>
      </div>
    </div>
  );
};

export function showCustomToast(message: string, imageSrc?: string) {
  toast.custom((t: Toast) => (
    <div className={`${t.visible ? "animate-enter" : "animate-leave"}`}>
      <CustomToast message={message} imageSrc={imageSrc} />
    </div>
  ));
}

export default CustomToast;
