'use client';
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
    <nav className="flex flex-row top-0 z-30 justify-between px-10 py-2 w-screen sticky bg-white">
      <Link href="/">
        <Image
          src="/newLogo.png"
          alt="logo"
          width={400}
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
            <li>
              <Link href="/profile">
                <Image
                  src="/user.png"
                  alt="Me"
                  width={30}
                  height={30}
                  className="cursor-pointer"
                />
              </Link>
            </li>
            <li>
              <button
                onClick={handleLogout}
                className="bg-cream-500 text-drab-dark-brown px-5 py-2 rounded-full border-2 border-drab-dark-brown hover:text-white hover:bg-drab-dark-brown"
              >
                Logout
              </button>
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
                      src="/images/home.png"
                      alt="Home"
                      width={30}
                      height={30}
                      className="cursor-pointer"
                    />
                  </Link>
                </li>
                <li>
                  <Link href="/network">
                    <Image
                      src="/images/network.png"
                      alt="My Network"
                      width={30}
                      height={30}
                      className="cursor-pointer"
                    />
                  </Link>
                </li>
                <li>
                  <Link href="/jobs">
                    <Image
                      src="/images/jobs.png"
                      alt="Jobs"
                      width={30}
                      height={30}
                      className="cursor-pointer"
                    />
                  </Link>
                </li>
                <li>
                  <Link href="/messaging">
                    <Image
                      src="/images/messaging.png"
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
                      src="/images/notifications.png"
                      alt="Notifications"
                      width={30}
                      height={30}
                      className="cursor-pointer"
                    />
                  </Link>
                </li>
                <li>
                  <Link href="/profile">
                    <Image
                      src="/images/profile.png"
                      alt="Me"
                      width={30}
                      height={30}
                      className="cursor-pointer"
                    />
                  </Link>
                </li>
                <li>
                  <button
                    onClick={handleLogout}
                    className="bg-cream-500 text-drab-dark-brown px-5 py-2 rounded-full border-2 border-drab-dark-brown hover:text-white hover:bg-drab-dark-brown"
                  >
                    Logout
                  </button>
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
