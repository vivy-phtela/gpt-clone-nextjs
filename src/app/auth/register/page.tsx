"use client";

import { createUserWithEmailAndPassword } from "firebase/auth";
import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { auth } from "../../../../firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Inputs = {
  email: string;
  password: string;
};

const Register = () => {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>();

  const onsubmit: SubmitHandler<Inputs> = async (data) => {
    await createUserWithEmailAndPassword(auth, data.email, data.password)
      .then((userCredential) => {
        const user = userCredential.user;
        router.push("/auth/login");
      })
      .catch((error) => {
        if (error.code === "auth/email-already-in-use") {
          alert("このメールアドレスは既に使用されています．");
        } else {
          alert(error.message);
        }
      });
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-zinc-800">
      <form
        onSubmit={handleSubmit(onsubmit)}
        className="bg-white p-8 rounded-lg shadow-lg w-96"
      >
        <h1 className="mb-4 text-2xl font-bold">新規登録</h1>
        <div className="mb-4">
          <label className="block text-sm font-medium">メールアドレス</label>
          <input
            {...register("email", {
              required: "メールアドレスは必須です．",
              pattern: {
                value:
                  /^[a-zA-Z0-9_.+-]+@([a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.)+[a-zA-Z]{2,}$/,
                message: "メールアドレスの形式が正しくありません．",
              },
            })}
            type="text"
            className="mt-1 border-2 rounded-md w-full p-2"
          />
          {errors.email && (
            <span className="text-red-600 text-sm">{errors.email.message}</span>
          )}
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium">パスワード</label>
          <input
            {...register("password", {
              required: "パスワードは必須です．",
              minLength: {
                value: 6,
                message: "パスワードは6文字以上で入力してください．",
              },
            })}
            type="password"
            className="mt-1 border-2 rounded-md w-full p-2"
          />
          {errors.password && (
            <span className="text-red-600 text-sm">
              {errors.password.message}
            </span>
          )}
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-zinc-900 text-white font-bold py-2 px-4 rounded hover:bg-zinc-700"
          >
            新規登録
          </button>
        </div>
        <div className="mt-4">
          <span className="text-gray-600 text-sm">
            既にアカウントをお持ちですか？
          </span>
          <Link
            href="/auth/login"
            className="text-blue-500 text-sm font-bold hover:text-blue-700"
          >
            ログイン
          </Link>
        </div>
      </form>
    </div>
  );
};

export default Register;
