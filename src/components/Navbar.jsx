import Image from "next/image";
import Link from "next/link";

const Navbar = () => {
  return (
    <nav className={`flex flex-row relative  z-30 justify-between px-10 py-2 w-screen`}>
      <Link href="/">
        <Image
          src="/image.png"
          alt="logo"
          width={200}
          height={100}
          className="m-0 p-0"
        />
      </Link>
      <ul className="hidden h-full gap-12 lg:flex m-4">
        <Link
          className="regular-16 text-gray-500 flex flex-row justify-center cursor-pointer hover:font-bold transition-all pb-1.5"
          href="/signup"
          label="sign up"
          key="signup"
        >
          Sign Up{" "}
        </Link>
        <Link href="/login" label="login" key="login" className="regular-16 text-gray-500 flex flex-row justify-center cursor-pointer hover:font-bold transition-all pb-1.5">
          Login{" "}
        </Link>
      </ul> 
      <Image src="/menu.png" alt="menu" height={15}  width={25} className="inline-block cursor-pointer lg:hidden"/>
    </nav>
  );
};

export default Navbar;
