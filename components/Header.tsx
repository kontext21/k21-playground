import Image from "next/image";
import logo from "@/app/assets/k21-logo.png";

const Header = () => {
  return (
    <header className="py-2">
      <div className="container flex flex-col">
        <div className="flex items-center gap-4 mb-4">
          <Image
            src={logo}
            alt="logo"
            className="w-[90px] h-auto"
          />
          <h1 className="text-4xl font-bold">
            Playground
          </h1>
          <p className="text-lg leading-relaxed">
            Make your software context-aware! The K21 SDK has everything you need to capture user data, contextualize it and deliver real value add.
          </p>
        </div>
      </div>
    </header>
  );
};

export default Header;
