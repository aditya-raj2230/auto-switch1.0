"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

const Navbar2 = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav
      className={`flex flex-row top-0 z-30 justify-between px-10 py-2 w-screen sticky bg-white`}
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
      <ul className={`hidden h-full gap-12 lg:flex m-4`}>
        <li>
          <button className="bg-white border-2 group border-black hover:border-black hover:text-white rounded-full hover:bg-black">
            <Link
              className="regular-16 text-black hover:text-white group-hover:text-white flex flex-row justify-center cursor-pointer group-hover:font-bold mr-5 ml-5"
              href="/signup"
              key="signup"
            >
              Sign Up
            </Link>
          </button>
        </li>
        <li>
          <button className="bg-white group border-2 border-black hover:border-black hover:text-white rounded-full hover:bg-black">
            <Link
              href="/login"
              key="login"
              className="regular-16 text-black hover:text-white flex flex-row group-hover:text-white justify-center cursor-pointer group-hover:font-bold mr-5 ml-5"
            >
              Login
            </Link>
          </button>
        </li>
      </ul>
      <div className="lg:hidden">
        <Image
          src="/menu.png"
          alt="menu"
          height={15}
          width={25}
          className="inline-block cursor-pointer"
          onClick={toggleMenu}
        />
        <div
          className={`fixed inset-y-0 right-0 bg-white z-40 flex flex-col items-center justify-center w-3/5 h-full transition-transform duration-300 ${
            isMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <button
            className="absolute top-4 right-4 text-3xl"
            onClick={toggleMenu}
          >
            &times;
          </button>
          <ul className="flex flex-col items-center gap-4 mt-8">
            <li>
              <button className="bg-white border-2 group border-black hover:border-black hover:text-white rounded-full hover:bg-black">
                <Link
                  className="regular-16 text-black hover:text-white group-hover:text-white flex flex-row justify-center cursor-pointer group-hover:font-bold mr-5 ml-5"
                  href="/signup"
                  key="signup"
                >
                  Sign Up
                </Link>
              </button>
            </li>
            <li>
              <button className="bg-white group border-2 border-black hover:border-black hover:text-white rounded-full hover:bg-black">
                <Link
                  href="/login"
                  key="login"
                  className="regular-16 text-black hover:text-white flex flex-row group-hover:text-white justify-center cursor-pointer group-hover:font-bold mr-5 ml-5"
                >
                  Login
                </Link>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar2;
