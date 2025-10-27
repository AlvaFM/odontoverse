import LogoImg from "../assets/img/odontoai.png"; // tu logo

export default function Header() {
  return (
    <header className="bg-gray-100 shadow-md w-full h-24 flex items-center px-6">
      {/* Logo */}
      <div className="flex items-center">
        <img src={LogoImg} alt="OdontoAI" className="h-20 w-auto object-contain" /> 
        <span className="ml-4 text-gray-800 font-bold text-xl"></span>
      </div>

      {/* Navegación o botones a la derecha */}
      <nav className="ml-auto flex items-center gap-4">
        {/* Botones opcionales */}
      </nav>
    </header>
  );
}
