import LoginForm from "@/components/LoginForm";
import Image from "next/image";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="container bg-white shadow-md rounded-lg p-6">
        <Image
          src="/image.png"
          alt="logo"
          width={200}
          height={100}
          className="ml-24 mb-8 p-0"
        />
        <LoginForm />
      </div>
    </div>
  );
}
