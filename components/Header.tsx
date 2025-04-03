import Image from "next/image";
import logo from "@/app/assets/k21-logo.png";

export default function Header() {
  return (
    <header className="py-1">
      <div className="container flex flex-col mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Image
            src={logo}
            alt="logo"
            className="w-[90px] h-auto"
            priority
            quality={90}
            loading="eager"
          />
          <h1 className="text-4xl font-bold">Playground</h1>
        </div>
        <p className="text-lg leading-relaxed">
          Make your software context-aware with the K21 SDK. It has everything
          you need to capture user data, contextualize it and deliver real value
          add.
        </p>
      </div>
    </header>
  );
}
