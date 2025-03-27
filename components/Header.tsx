import Image from "next/image";
import logo from "@/app/assets/k21-logo.png";

const Header = () => {
  return (
    <header className="py-2">
      <div className="container flex justify-between items-center">
        <Image
          src={logo}
          alt="logo"
          width={120}
          height={120}
          className="w-[120px] h-auto"
        />
        <p className="text-lg leading-relaxed text-center">
          We build tools for developers to make sense of their users&apos;
          context. A lot of user data is outside of reach for apps, because
          access requires APIs and permissions. We allow developers to query
          information directly from the screen, voice and operating system.
        </p>
      </div>
    </header>
  );
};

export default Header;
