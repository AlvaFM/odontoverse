import LogoImg from "../assets/img/odontoai.png";

interface HeaderProps {
  logoSize?: number; 
}

export default function Header({ logoSize = 100 }: HeaderProps) { 
  return (
    <>
      {/* HEADER MINIMALISTA */}
      <header className="w-full bg-[#E3F2F9] flex justify-center items-center py-6">
        <div className="flex flex-col items-center">
          <img
            src={LogoImg}
            alt="OdontoAI"
            style={{ height: logoSize, width: "auto", objectFit: "contain" }}
            className="transition-transform duration-300 hover:scale-105"
          />
        </div>
      </header>
    </>
  );
}
