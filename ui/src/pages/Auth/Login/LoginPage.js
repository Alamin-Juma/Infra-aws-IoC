import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { IoIosArrowRoundBack } from "react-icons/io";
import axios from "axios";
import bgImage from "../../../assets/bg003.png";
import projectLogo from "../../../assets/logo.png";
import AuthLayout from "../../../layouts/AuthLayout";
import withAuth from "../../../utils/withAuth";
import config from "../../../configs/app.config";
import Spinner from "../../../components/Spinner";
import { ToastContainer, toast } from "react-toastify";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import "react-toastify/dist/ReactToastify.css";
import { jwtDecode } from "jwt-decode"; 

const LoginPage = () => {
  const navigate = useNavigate();

  const API_BASE_URL = config.API_BASE_URL;
  const ACCESS_TOKEN_NAME = config.ACCESS_TOKEN_NAME;
  const REFRESH_TOKEN_NAME = config.REFRESH_TOKEN_NAME;
  const USER_ROLE = config.USER_ROLE;
  const AUTHORITIES = config.AUTHORITIES;

  const { setUser, forceRefreshAuthContext } = useAuth();

  const [state, setState] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isAccountLocked, setAccountLock] = useState(false);

  useEffect(() => {
    setState((prevState) => ({
      ...prevState,
      email: getCookie("email") || prevState.email, // Set email if cookie exists
      password: getCookie("password") || prevState.password, // Set password if cookie exists
    }));
    setIsChecked(getCookie("isChecked") === "true");
    const lock = getCookie("invalidLogin") >= 5;
    if (lock) {
      setError(
        "Your account has been locked. Please contact the system administrator."
      );
      setAccountLock(true);
    }
  }, []);

  const isFormValid = () => {
    return (
      state.email.trim() !== "" &&
      state.password.trim() !== "" &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email) // Basic email validation
    );
  };

  //   const notify = () => {
  //     toast.success("Login successful!");
  //   };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setState((prevState) => ({
      ...prevState,
      [id]: value,
    }));
  };
  const handleCheckboxChange = (event) => {
    setIsChecked(event.target.checked);
  };

  const setCookie = (name, value, days = 3650) => {
    const d = new Date();
    d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = "expires=" + d.toUTCString();
    document.cookie = `${name}=${value};${expires};path=/`;
  };
  const getCookie = (name) => {
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookies = decodedCookie.split(";"); // Split the cookie string into individual cookies
    for (let i = 0; i < cookies.length; i++) {
      let cookie = cookies[i].trim(); // Remove any extra spaces
      if (cookie.indexOf(name + "=") === 0) {
        return cookie.substring(name.length + 1, cookie.length);
      }
    }
    return "";
  };

  const onLoginClick = (e) => {
    e.preventDefault();

    setError("");
    setSuccessMessage("");
    setLoading(true);

    if (!state.email && !state.password) {
      setError("Please enter your email address and password.");
    } else if (!state.email) {
      setError("Please enter your email address.");
    } else if (!validateEmail(state.email)) {
      setError("Please enter a valid email address.");
    } else if (!state.password) {
      setError("Please enter your password.");
    } else {
      setError("");
      setSuccessMessage("");

      const payload = {
        email: state.email,
        password: state.password,
      };
      axios
        .post(API_BASE_URL + "/auth/login", payload)
        .then(function (response) {
          setLoading(false);
          if (response.status === 200) {
            setSuccessMessage("Login Successful!");
          
            const decoded = jwtDecode(response.data.accessToken);
            let user=decoded.user??response.data.user;
            let userRole=decoded.role??response.data.role.name;
            let authorities=decoded.permissions.map(e=>e.toUpperCase())??[];
            
            localStorage.setItem(ACCESS_TOKEN_NAME, response.data.accessToken);
            localStorage.setItem(REFRESH_TOKEN_NAME, response.data.refreshToken);
            localStorage.setItem(USER_ROLE, userRole);
            localStorage.setItem(USER_ROLE, userRole);
            localStorage.setItem(AUTHORITIES, authorities);
            
            const userData = {
              id: user.userId,
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              role: userRole,
            };

            setUser(userData);
            localStorage.setItem("user", JSON.stringify(userData));
            if (isChecked) {
              //add email and password to cookie
              setCookie("email", state.email);
              setCookie("password", state.password);
              setCookie("isChecked", "true");
            } else {
              //remove the cookies
              setCookie("email", "", -1);
              setCookie("password", "", -1);
              setCookie("isChecked", "false", -1);
            }
            //toast.success("Login successful!", { autoClose: 500 });
            forceRefreshAuthContext();
            setTimeout(() => {
              navigate("/app/dashboard", {state: { forceRefresh: true } });
            }, 1000);
          } else if (response.status === 404) {
            setError(
              "The account does not exist. Please contact the system administrator."
            );
          } else if (response.status === 400) {
            var count = getCookie("invalidLogin")
              ? getCookie("invalidLogin")
              : 0;
            setCookie("invalidLogin", count++, 3 / (24 * 60));
            if (count >= 5) {
              setError(
                "Your account has been locked. Please contact the system administrator."
              );
              setAccountLock(true);
              sendAccountLockEmail(state.email);
            } else {
              setError("Invalid username or password");
            }
          } else {
            setError(
              "Unexpected Error. Please contact the system administrator."
            );
          }
        })
        .catch(function (error) {
          setLoading(false);
          if (error.status === 404) {
            setError(
              "The account does not exist. Please contact the system administrator."
            );
          } else if (error.status === 400) {
            var count = getCookie("invalidLogin")
              ? parseInt(getCookie("invalidLogin"))
              : 0;

            setCookie("invalidLogin", count + 1, 3 / (24 * 60));
            if (count >= 5) {
              setError(
                "Your account has been locked. Please contact the system administrator."
              );
              setAccountLock(true);
              sendAccountLockEmail(state.email);
            } else {
              setError("Invalid username or password");
            }
          } else {
            setError(
              "Unexpected Error. Please contact the system administrator."
            );
          }
        });
    }
  };
  const validateEmail = (email) => {
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
    return emailRegex.test(email);
  };

  const sendAccountLockEmail = async (lockedEmail) => {
    const htmlBody = getEmailMarkup(lockedEmail);
    const payload = {
      email: config.ADMIN_EMAIL,
      subject: "Security Alert: Multiple Failed Login Attempts Detected",
      htmlBody: htmlBody,
      template: "lock_account",
      data: {
        account_to_lock: lockedEmail,
      },
    };
    axios
      .post(API_BASE_URL + "/email/send-email", payload)
      .catch(function (error) {
        throw new Error("Failed to send account lock email: " + error.message);
      });
  };
  function getEmailMarkup(lockedEmail) {
    const html = `<div style="max-width: 600px; margin: 20px auto; background: #f9f9f9; padding: 20px; text-align: center; font-family: Arial, sans-serif; border-radius: 8px;">
    <h1 style="color: #d9534f;">Security Alert</h1>
    <p style="color: #333;">We have detected multiple unsuccessful login attempts for <b>${lockedEmail}</b>.</p>
    <p style="color: #555;">As a security measure, please review this activity and take appropriate action if necessary.</p>
    <p style="margin-top: 20px; font-size: 14px; color: #777;">Best regards,</p>
    <p style="font-size: 12px; color: #777;">&copy; 2025 Itrack. All rights reserved.</p>
</div>`;
    return html;
  }

  return (
    <div className="bg-gray-100 flex justify-center items-center h-screen overflow-hidden">
      <ToastContainer position="top-right" />
      <div className="w-1/2 h-screen hidden lg:block relative">
        <img
          src={bgImage}
          alt="Placeholder Image"
          className="object-cover w-full h-full"
        />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">Welcome Back!</h2>
          <p className="text-lg">Please login to access our IT inventory</p>
        </div>
      </div>

      <div className="lg:p-36 md:p-52 sm:20 p-8 w-full lg:w-1/2">
        <div className="flex justify-center items-center w-full">
          <img src={projectLogo} alt="Logo" />
        </div>
        {!isAccountLocked && (
          <legend className="text-2xl font-semibold text-left text-gray-700 mb-4">
            Login
          </legend>
        )}
        <form>
          {error && (
            <div className="mb-4 alert alert-error">
              <svg
                width="48"
                height="48"
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M24 4C12.96 4 4 12.96 4 24C4 35.04 12.96 44 24 44C35.04 44 44 35.04 44 24C44 12.96 35.04 4 24 4ZM24 26C22.9 26 22 25.1 22 24V16C22 14.9 22.9 14 24 14C25.1 14 26 14.9 26 16V24C26 25.1 25.1 26 24 26ZM26 34H22V30H26V34Z"
                  fill="#E92C2C"
                />
              </svg>
              <div className="flex flex-col">
                <span>Error!</span>
                <span className="text-content2">{error}</span>
              </div>
            </div>
          )}
          {successMessage && (
            <div className="alert alert-success">
              <svg
                width="48"
                height="48"
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M24 4C12.96 4 4 12.96 4 24C4 35.04 12.96 44 24 44C35.04 44 44 35.04 44 24C44 12.96 35.04 4 24 4ZM18.58 32.58L11.4 25.4C10.62 24.62 10.62 23.36 11.4 22.58C12.18 21.8 13.44 21.8 14.22 22.58L20 28.34L33.76 14.58C34.54 13.8 35.8 13.8 36.58 14.58C37.36 15.36 37.36 16.62 36.58 17.4L21.4 32.58C20.64 33.36 19.36 33.36 18.58 32.58Z"
                  fill="#00BA34"
                />
              </svg>
              <div className="flex flex-col">
                <span>Success</span>
                <span className="text-content2">{successMessage}</span>
              </div>
            </div>
          )}
          {!isAccountLocked && (
            <div>
              <div className="mb-4">
                <label htmlFor="email" className="block text-gray-600">
                  Email
                </label>
                <input
                  type="text"
                  id="email"
                  maxLength={50}
                  name="email"
                  placeholder="Enter your email address"
                  onChange={handleChange}
                  value={state.email}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:border-[#77B634]"
                  autoComplete="off"
                />
              </div>

              <div className="mb-4 relative">
                <label htmlFor="password" className="block text-gray-600">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    maxLength={20}
                    id="password"
                    placeholder="Enter your password"
                    onChange={handleChange}
                    name="password"
                    value={state.password}
                    className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:border-[#77B634] focus:border-[.5px]"
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-500 hover:text-gray-700 focus:outline-none"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              <div className="mb-4">
                <input
                  type="checkbox"
                  id="remember"
                  name="remember"
                  checked={isChecked}
                  onChange={handleCheckboxChange}
                  className="text-blue-500 cursor-pointer"
                />
                <label htmlFor="remember" className="ml-2 text-gray-500">
                  Remember me
                </label>
              </div>

              <div className="mb-6 text-blue-500">
                <Link className="hover:underline" to={"/auth/forgot-password"}>
                  Forgot Password?
                </Link>
              </div>

              <div className="mt-4">
                <button
                  type="submit"
                  onClick={onLoginClick}
                  className={`rounded-lg btn text-white bg-[#77B634] btn-block ${
                    !isFormValid() ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  disabled={!isFormValid() || loading}
                >
                  {loading ? <Spinner /> : "Login"}
                </button>
              </div>
            </div>
          )}
        </form>

        <div className="mt-6 text-blue-500">
          <Link
            className="flex gap-2 items-center text-center justify-center"
            to={"/"}
          >
            <IoIosArrowRoundBack /> <a className="hover:underline">Back</a>
          </Link>
        </div>
      </div>
    </div>
  );
};

const WrappedLanding = withAuth(LoginPage, true);
export default () => (
  <AuthLayout>
    <WrappedLanding />
  </AuthLayout>
);
