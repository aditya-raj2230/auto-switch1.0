"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/app/firebase/config";

const Navbar2 = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <nav className="flex flex-row top-0 z-30 justify-between px-10 py-2 w-screen sticky bg-white">
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
        {user ? (
          <li>
            <button
              onClick={handleLogout}
              className="bg-white border-2 group border-black hover:border-black hover:text-white rounded-full hover:bg-black px-5 py-2"
            >
              Logout 
            </button>
          </li>
        ) : (
          <>
            <li>
              <button className="bg-white border-2 group border-black hover:border-black hover:text-white rounded-full hover:bg-black px-5 py-2">
                <Link
                  href="/auth/signup"
                  className="regular-16 text-black group-hover:text-white"
                >
                  Sign Up
                </Link>
              </button>
            </li>
            <li>
              <button className="bg-white border-2 group border-black hover:border-black hover:text-white rounded-full hover:bg-black px-5 py-2">
                <Link
                  href="/auth/login"
                  className="regular-16 text-black group-hover:text-white"
                >
                  Login
                </Link>
              </button>
            </li>
          </>
        )}
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
            {user ? (
              <li>
                <button
                  onClick={handleLogout}
                  className="bg-white border-2 group border-black hover:border-black hover:text-white rounded-full hover:bg-black px-5 py-2"
                >
                  Logout 
                </button>
              </li>
            ) : (
              <>
                <li>
                  <button className="bg-white border-2 group border-black hover:border-black hover:text-white rounded-full hover:bg-black px-5 py-2">
                    <Link
                      href="/auth/signup"
                      className="regular-16 text-black group-hover:text-white"
                    >
                      Sign Up
                    </Link>
                  </button>
                </li>
                <li>
                  <button className="bg-white border-2 group border-black hover:border-black hover:text-white rounded-full hover:bg-black px-5 py-2">
                    <Link
                      href="/auth/login"
                      className="regular-16 text-black group-hover:text-white"
                    >
                      Login
                    </Link>
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar2;
