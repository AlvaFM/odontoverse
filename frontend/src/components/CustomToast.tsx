import React from "react";
import toast, { Toast } from "react-hot-toast";

interface CustomToastProps {
  message: string;
  imageSrc?: string;
}

const CustomToast: React.FC<CustomToastProps> = ({ message, imageSrc }) => {
  return (
    <div className="flex justify-center">
      <div className="bg-[#D6E6F2] border border-[#B0CDE8] rounded-2xl p-6 flex flex-col items-center gap-4 shadow-xl w-72 sm:w-80">
        {imageSrc && (
          <img src={imageSrc} alt="icon" className="h-16 w-16 object-contain" />
        )}
        <span className="text-[#034C7D] font-semibold text-center text-sm sm:text-base">
          {message}
        </span>
      </div>
    </div>
  );
};

export function showCustomToast(message: string, imageSrc?: string) {
  toast.custom((t: Toast) => (
    <div
      className={`transform transition-all duration-300 ${
        t.visible ? "opacity-100 scale-100" : "opacity-0 scale-90"
      }`}
    >
      <CustomToast message={message} imageSrc={imageSrc} />
    </div>
  ));
}

export default CustomToast;
