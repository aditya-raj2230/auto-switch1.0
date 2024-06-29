"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/app/firebase/config";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";

const Navbar2 = () => {
  const [isVerified, setIsVerified] = useState(false);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
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

  useEffect(() => {
    if (user) {
      const notificationsRef = collection(db, "users", user.uid, "notifications");
      const q = query(notificationsRef, where("read", "==", false));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          setHasUnreadNotifications(true);
        } else {
          setHasUnreadNotifications(false);
        }
      });

      return () => unsubscribe();
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <nav className="flex flex-row mt-4 md:mt-0 top-0 z-30 justify-between px-4 md:px-10 py-2 w-screen sticky bg-green-50 border-2 border-gray-400">
      <Link href="/">
        <Image
          src="/newLogo-removebg-preview.png"
          alt="logo"
          width={250}
          height={100}
          className="m-0 p-0 md:block hidden"
        />
      </Link>
      <ul className="flex h-full gap-6 md:gap-4 lg:gap-12 m-2 md:m-4 md:justify-evenly mr-0  items-center text-xs md:text-base">
        {user && isVerified ? (
          <>
            <li className="navbar-icon">
              <Link href="/">
                <Image
                  src="/home.png"
                  alt="Home"
                  width={40}
                  height={40}
                  className="cursor-pointer"
                />
              </Link>
            </li>
            <li className="navbar-icon">
              <Link href="/marketPlace">
                <Image
                  src="/car(1).png"
                  alt="Market Place"
                  width={40}
                  height={40}
                  className="cursor-pointer"
                />
              </Link>
            </li>
            <li className="navbar-icon">
              <Link href="/requests">
                <Image
                  src="/handshake.png"
                  alt="Requests"
                  width={40}
                  height={40}
                  className="cursor-pointer"
                />
              </Link>
            </li>
            <li className="navbar-icon hidden md:block">
              <Link href="/addFriends">
                <Image
                  src="/users-alt.png"
                  alt="Add Friends"
                  width={40}
                  height={40}
                  className="cursor-pointer"
                />
              </Link>
            </li>
            <li className="navbar-icon">
              <Link href="/chat">
                <Image
                  src="/paper-plane.png"
                  alt="Chat"
                  width={40}
                  height={40}
                  className="cursor-pointer"
                />
              </Link>
            </li>
            <li className="navbar-icon">
              <Link href="/notifications">
                <Image
                  src={hasUnreadNotifications ? "/notification2.png" : "/bell.png"}
                  alt="Notifications"
                  width={40}
                  height={40}
                  className="cursor-pointer"
                />
              </Link>
            </li>
            <li className="relative group navbar-icon">
              <Image
                src="/user.png"
                alt="Profile"
                width={40}
                height={40}
                className="cursor-pointer mb-2"
              />
              <div className="absolute left-1/2 transform -translate-x-1/2 md:top-[calc(100%+0.5rem)] md:-translate-y-0 top-[-200%] hidden group-hover:block bg-white shadow-lg border-2 rounded-lg w-40 z-10">
                <Link
                  href="/profile"
                  className="bg-green-500 text-white px-5 py-2 rounded-t-lg border-b-2 border-green-700 block whitespace-nowrap hover:bg-green-700"
                >
                  View Profile
                </Link>
                <Link
                  href="/addFriends"
                  className="bg-green-500 text-white px-5 py-2 border-b-2 border-green-700 block whitespace-nowrap hover:bg-green-700 md:hidden"
                >
                  Add Friends
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-green-500 text-white px-5 py-2 w-full rounded-b-lg border-b-2 border-green-700 block whitespace-nowrap hover:bg-green-700"
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
                <button className="bg-green-500 text-drab-dark-brown w-24 py-1 px-4 rounded-full border-2 border-green-700 hover:text-white hover:bg-green-700">
                  Sign Up
                </button>
              </Link>
            </li>
            <li>
              <Link href="/auth/login">
                <button className="bg-green-500 text-drab-dark-brown px-4 py-1 rounded-full border-2 border-green-700 hover:text-white hover:bg-green-700">
                  Login
                </button>
              </Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar2;
