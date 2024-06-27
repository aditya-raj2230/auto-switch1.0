"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/app/firebase/config";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext"; // Import the AuthContext

const Navbar2 = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      console.log(user.uid, "User ID");
    }
  }, [user]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser && currentUser.emailVerified) {
        setIsVerified(true);
      } else {
        setIsVerified(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isVerified && user) {
        onAuthStateChanged(auth, (currentUser) => {
          if (currentUser && currentUser.emailVerified) {
            setIsVerified(true);
          }
        });
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval); // Clean up the interval on component unmount
  }, [isVerified, user]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <nav className="flex flex-row top-0 z-30 justify-between px-10 py-2 w-screen sticky bg-green-50 border-2 border-gray-400 ">
      <Link href="/">
        <Image
          src="/newLogo-removebg-preview.png"
          alt="logo"
          width={250}
          height={100}
          className="m-0 p-0"
        />
      </Link>
      <ul className="hidden h-full gap-12 lg:flex m-4">
        {user && isVerified ? (
          <>
            <li>
              <Link href="/">
                <Image
                  src="/home.png"
                  alt="Home"
                  width={30}
                  height={30}
                  className="cursor-pointer"
                />
              </Link>
            </li>
            <li>
              <Link href="/addFriends">
                <Image
                  src="/users-alt.png"
                  alt="My Network"
                  width={30}
                  height={30}
                  className="cursor-pointer"
                />
              </Link>
            </li>

            <li>
              <Link href="/chat">
                <Image
                  src="/paper-plane.png"
                  alt="Messaging"
                  width={30}
                  height={30}
                  className="cursor-pointer"
                />
              </Link>
            </li>
            <li>
              <Link href="/notifications">
                <Image
                  src="/bell.png"
                  alt="Notifications"
                  width={30}
                  height={30}
                  className="cursor-pointer"
                />
              </Link>
            </li>
            <li className="relative group ">
              <Image
                src="/user.png"
                alt="Me"
                width={30}
                height={30}
                className="cursor-pointer mb-2"
              />

              <div className="absolute left-1/2 transform -translate-x-1/2  hidden group-hover:block bg-white shadow-lg rounded-lg  w-32 ">
                <Link
                  href="/profile"
                  className="bg-green-500 text-white px-5 py-2 rounded-t-lg border-b-0 border-2 border-green-700 block whitespace-nowrap hover:bg-green-700"
                >
                  View Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-green-500 text-white px-5 py-2 w-32 rounded-b-lg border-2 border-green-700 block whitespace-nowrap hover:bg-green-700"
                >
                  Logout
                </button>
              </div>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link href="/auth/signup">
                <button className="bg-cream-500 text-drab-dark-brown px-5 py-2 rounded-full border-2 border-drab-dark-brown hover:text-white hover:bg-drab-dark-brown">
                  Sign Up
                </button>
              </Link>
            </li>
            <li>
              <Link href="/auth/login">
                <button className="bg-cream-500 text-drab-dark-brown px-5 py-2 rounded-full border-2 border-drab-dark-brown hover:text-white hover:bg-drab-dark-brown">
                  Login
                </button>
              </Link>
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
            {user && isVerified ? (
              <>
                <li>
                  <Link href="/">
                    <Image
                      src="/home.png"
                      alt="Home"
                      width={30}
                      height={30}
                      className="cursor-pointer"
                    />
                  </Link>
                </li>
                <li>
                  <Link href="/addFriends">
                    <Image
                      src="/users-alt.png"
                      alt="My Network"
                      width={30}
                      height={30}
                      className="cursor-pointer"
                    />
                  </Link>
                </li>
             
                <li>
                  <Link href="/chat">
                    <Image
                      src="/paper-plane.png"
                      alt="Messaging"
                      width={30}
                      height={30}
                      className="cursor-pointer"
                    />
                  </Link>
                </li>
                <li>
                  <Link href="/notifications">
                    <Image
                      src="/bell.png"
                      alt="Notifications"
                      width={30}
                      height={30}
                      className="cursor-pointer"
                    />
                  </Link>
                </li>
                <li className="relative group">
                  <Image
                    src="/user.png"
                    alt="Me"
                    width={30}
                    height={30}
                    className="cursor-pointer"
                  />
                  <div className="absolute hidden group-hover:block bg-white shadow-lg rounded-lg mt-2">
                    <Link
                      href="/profile"
                      className="bg-cream-500 text-drab-dark-brown px-5 py-2 rounded-t-lg border-b-2 border-drab-dark-brown w-full text-left hover:text-white hover:bg-drab-dark-brown"
                    >
                      View Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="bg-cream-500 text-drab-dark-brown px-5 py-2 rounded-b-lg border-2 border-drab-dark-brown w-full text-left hover:text-white hover:bg-drab-dark-brown"
                    >
                      Logout
                    </button>
                  </div>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link href="/auth/signup">
                    <button
                      className="bg-cream-500 text-drab-dark-brown px-5 py-2 rounded-full border-2 border-drab-dark-brown hover:text-white hover:bg-drab-dark-brown"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Sign Up
                    </button>
                  </Link>
                </li>
                <li>
                  <Link href="/auth/login">
                    <button
                      className="bg-cream-500 text-drab-dark-brown px-5 py-2 rounded-full border-2 border-drab-dark-brown hover:text-white hover:bg-drab-dark-brown"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Login
                    </button>
                  </Link>
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
