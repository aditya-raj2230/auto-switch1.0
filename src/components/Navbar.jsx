import Image from "next/image";
import Link from "next/link";

const Navbar = () => {
  return (
    <nav
      className={`flex flex-row relative  z-30 justify-between px-10 py-2 w-screen`}
    >
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
        <button className="bg-white border-2 border-black  boder-2 hover:border-black  hover:text-white rounded-full  hover:bg-black pr-5 pl-5">
          {" "}
          <Link
            className="regular-16 text-black  hover:text-white    flex flex-row justify-center cursor-pointer hover:font-bold  "
            href="/signup"
            label="sign up"
            key="signup"
          >
            Sign Up{" "}
          </Link>
        </button>
        <button className="bg-white border-2 border-black  boder-2 hover:border-black  hover:text-white rounded-full  hover:bg-black pr-5 pl-5">
          <Link
            href="/login"
            label="login"
            key="login"
            className="regular-16 text-black  hover:text-white    flex flex-row justify-center cursor-pointer hover:font-bold  "
          >
            Login{" "}
          </Link>
        </button>
      </ul>
      <Image
        src="/menu.png"
        alt="menu"
        height={15}
        width={25}
        className="inline-block cursor-pointer lg:hidden"
      />
    </nav>
  );
};

export default Navbar;
