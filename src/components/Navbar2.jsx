"use client";
import { useState, useEffect, useRef } from "react";
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
  const [isProfileBoxVisible, setIsProfileBoxVisible] = useState(false);
  const router = useRouter();
  const { user } = useAuth();
  const profileBoxRef = useRef(null);

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
      const notificationsRef = collection(
        db,
        "users",
        user.uid,
        "notifications"
      );
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
      router.push("/");
      await signOut(auth);

      setIsProfileBoxVisible(false);
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleProfileClick = () => {
    setIsProfileBoxVisible(!isProfileBoxVisible);
  };

  const handleClickOutside = (event) => {
    if (
      profileBoxRef.current &&
      !profileBoxRef.current.contains(event.target)
    ) {
      setIsProfileBoxVisible(false);
    }
  };

  useEffect(() => {
    if (isProfileBoxVisible) {
      document.addEventListener("click", handleClickOutside);
    } else {
      document.removeEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isProfileBoxVisible]);

  return (
    <>
      <nav className="flex flex-row md:mt-0 top-0 z-30 justify-between px-4 md:px-10 py-2 w-screen sticky bg-green-50 border-2 border-gray-400">
        <Link href="/">
          <Image
            src="/newLogo-removebg-preview.png"
            alt="logo"
            width={250}
            height={100}
            className="m-0 p-0 md:block hidden"
          />
        </Link>
        <ul className="flex h-full gap-6 md:gap-4 lg:gap-12 m-2 md:m-4 md:justify-evenly mr-0 items-center text-xs md:text-base">
          {user && !isVerified ? (
            <div
              onClick={handleLogout}
              className="bg-green-500 text-white px-5 py-2 w-full rounded-b-lg border-b-2 border-green-700 hover:bg-green-700 text-center cursor-pointer"
            >
              Go Back
            </div>
          ) : user && isVerified ? (
            <>
              <li className="relative navbar-icon">
                <Image
                  src="/user.png"
                  alt="Profile"
                  width={40}
                  height={40}
                  className="cursor-pointer mb-2"
                  onClick={handleProfileClick}
                />
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
                    src={
                      hasUnreadNotifications
                        ? "/notification2.png"
                        : "/bell.png"
                    }
                    alt="Notifications"
                    width={40}
                    height={40}
                    className="cursor-pointer"
                  />
                </Link>
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
        {/* 
        {user && !isVerified?( <div
              onClick={handleLogout}
              className="bg-green-500 text-white px-5 py-2 w-full rounded-b-lg border-b-2 border-green-700 hover:bg-green-700 text-center cursor-pointer"
            >
              Logout
            </div>):(null)} */}
      </nav>
      {isProfileBoxVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
          <div
            ref={profileBoxRef}
            className="bg-white shadow-lg border-2 rounded-lg w-80 z-50"
          >
            <Link
              href="/"
              onClick={() => {
                setIsProfileBoxVisible(false);
              }}
            >
              <div className="bg-green-500 text-white px-5 py-2 rounded-t-lg border-b-2 border-green-700 hover:bg-green-700 text-center cursor-pointer">
                View Profile
              </div>
            </Link>
            <Link
              href="/addFriends"
              onClick={() => {
                setIsProfileBoxVisible(false);
              }}
            >
              <div className="bg-green-500 text-white px-5 py-2 border-b-2 border-green-700 hover:bg-green-700 text-center cursor-pointer">
                Add Friends
              </div>
            </Link>
            <div
              onClick={handleLogout}
              className="bg-green-500 text-white px-5 py-2 w-full rounded-b-lg border-b-2 border-green-700 hover:bg-green-700 text-center cursor-pointer"
            >
              Logout
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar2;
