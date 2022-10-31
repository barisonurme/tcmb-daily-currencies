import React, { useState } from "react";
import Input from "./ui/Input";
import LoadingSpinner from "./ui/LoadingSpinner";

var bcrypt = require("bcryptjs");
var salt = bcrypt.genSaltSync(10);

const Login = (props) => {
  const [processing, setProcessing] = useState(false);
  const [isLoginForm, setIsLoginForm] = useState(true);
  const [error, setError] = useState(null);
  const [username, setUserName] = useState("");
  const [password, setPassword] = useState("");

  // Form Submit Handler
  const submitHandler = async (event) => {
    event.preventDefault();
    var hashPassword = bcrypt.hashSync(password, salt);
    setProcessing(true);
    if (!isLoginForm) {
      try {
        await fetch("http://localhost:3000/register/", {
          method: "POST",
          body: JSON.stringify({ username, password: hashPassword }),
          headers: { "Content-Type": "application/json" },
        })
          .then((response) => {
            return response.json();
          })
          .then((data) => {
            props.onLogin(true);
          });
      } catch (error) {
        setError("Kullanıcı adı kullanımda");
        setProcessing(false);
      }
    } else {
      try {
        await fetch("http://localhost:3000/generateTokens/", {
          method: "POST",
          body: JSON.stringify({ username, password }),
          headers: { "Content-Type": "application/json" },
        })
          .then((response) => {
            return response.json();
          })
          .then((data) => {
            props.onLogin(true);
          });
      } catch (error) {
        setError("Başarısız deneme");
        setProcessing(false);
      }
    }
  };

  // Login formu toggle
  const formHandler = (state) => {
    setError(null);
    setProcessing(false);
    setIsLoginForm(state);
  };
  const onInputChange = (strokes, placeHolder) => {
    setError(null);
    setProcessing(false);
    switch (placeHolder) {
      case "Kullanıcı İsmi":
        setUserName(strokes);
        break;
      case "Şifre":
        setPassword(strokes);
        break;
      default:
        break;
    }
  };

  return (
    <div className="flex flex-col w-full justify-center items-center h-screen bg-gray-300">
      {isLoginForm ? (
        <form
          onSubmit={submitHandler}
          className="w-96 bg-white p-8 flex flex-col rounded-xl shadow-md border"
        >
          <div className="w-full flex justify-center font-bold mb-5 font-sans text-2xl text-gray-600">
            Giriş Ekranı
          </div>
          <Input onInputChange={onInputChange} placeHolder="Kullanıcı İsmi" />
          <Input
            onInputChange={onInputChange}
            placeHolder="Şifre"
            styles={"mt-2"}
          />
          <div></div>
          <button
            type="submit"
            className={`w-full h-12 text-white rounded-xl mt-4 justify-center items-center flex ${
              error ? "bg-red-500" : "bg-blue-500"
            }`}
          >
            {processing && <LoadingSpinner styles={"border-4 h-6 w-6 "} />}
            {error && !processing ? `${error}` : "Giriş Yap"}
          </button>
          <div className="flex w-full justify-center items-center pt-4">
            Hesabın yok mu? Buradan&nbsp;
            <div
              onClick={() => formHandler(false)}
              className="text-bold text-blue-500"
            >
              kayıt ol.
            </div>
          </div>
        </form>
      ) : (
        <form
          onSubmit={submitHandler}
          className="w-96 bg-white p-8 flex flex-col rounded-xl shadow-md border"
        >
          <div className="w-full flex justify-center font-bold mb-5 font-sans text-2xl text-gray-600">
            Kayıt Ekranı
          </div>
          <Input onInputChange={onInputChange} placeHolder="Kullanıcı İsmi" />
          <Input
            onInputChange={onInputChange}
            placeHolder="Şifre"
            styles={"mt-2"}
          />
          <div></div>
          <button
            type="submit"
            className={`w-full h-12 text-white rounded-xl mt-4 justify-center items-center flex ${
              error ? "bg-red-500" : "bg-blue-500"
            }`}
          >
            {processing && <LoadingSpinner styles={"border-4 h-6 w-6 "} />}
            {error && !processing ? `${error}` : "Kayıt Ol"}
          </button>
          <div className="flex w-full justify-center items-center pt-4">
            Hesabın var mı? Buradan&nbsp;
            <div
              onClick={() => formHandler(true)}
              className="text-bold text-blue-500"
            >
              giriş yap.
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default Login;
