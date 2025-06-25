import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Leaf, Eye, EyeOff, RedoIcon } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Local state for client-side validation errors
  const [validationErrors, setValidationErrors] = useState({});
  // State for server-side validation errors
  const [serverErrors, setServerErrors] = useState({});

  // Get Redux state and functions
  const { register, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();

  // Client-side validation function
  const validateForm = () => {
    const errors = {};

    // Check if passwords match
    if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    // Check if required fields are filled
    if (!firstName.trim()) errors.firstName = "First name is required";
    if (!lastName.trim()) errors.lastName = "Last name is required";
    if (!email.trim()) errors.email = "Email is required";
    if (!password.trim()) errors.password = "Password is required";
    if (!confirmPassword.trim()) errors.confirmPassword = "Please confirm your password";

    // Basic password validation (you can make this more robust)
    if (password && password.length < 6) {
      errors.password = "Password must be at least 6 characters long";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous errors
    // clearError();
    setValidationErrors({});
    setServerErrors({});

    // Run client-side validation
    if (!validateForm()) {
      return;
    }

    // Prepare data for API (INCLUDE confirmPassword since server expects it)
    const signupData = {
      firstName,
      lastName,
      email,
      password,
      confirmPassword, // Include this for server validation
      role: "user" // Add default role if your server expects it
    };

    try {
      // Dispatch signup action through Redux
      const result = await register(signupData);

      // Check if signup was successful
      if (result.type === "auth/signupUser/fulfilled") {
        // Store token temporarily
        localStorage.setItem("token", result.payload.token);
        // Navigate to login page
        navigate("/login");
      } else if (result.type === "auth/signupUser/rejected") {
        // Handle server validation errors
        const errorPayload = result.payload;
        console.log("Error payload:", errorPayload); // Debug log
        
        if (errorPayload && errorPayload.errors && Array.isArray(errorPayload.errors)) {
          // Format server errors for display
          const formattedErrors = {};
          errorPayload.errors.forEach((error) => {
            console.log("Processing error:", error); // Debug log
            formattedErrors[error.path] = error.msg;
          });
          console.log("Formatted errors:", formattedErrors); // Debug log
          setServerErrors(formattedErrors);
        }
      }
    } catch (err) {
      console.error("Signup error:", err);
    }
  };

  // Function to get error message for a field (checks both client and server errors)
  const getFieldError = (fieldName) => {
    return validationErrors[fieldName] || serverErrors[fieldName];
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="bg-green-600 p-3 rounded-full">
              <Leaf className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Join EcoWise
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-green-600 hover:text-green-500"
            >
              Sign in here
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="firstname"
                className="block text-sm font-medium text-gray-700"
              >
                First Name
              </label>
              <input
                id="firstname"
                name="firstName"
                type="text"
                required
                value={firstName}
                onChange={(e) => {
                  setFirstName(e.target.value);
                  // Clear errors when user starts typing
                  if (getFieldError('firstName')) {
                    setValidationErrors(prev => ({...prev, firstName: ''}));
                    setServerErrors(prev => ({...prev, firstName: ''}));
                  }
                }}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                placeholder="Enter your first name"
              />
              {getFieldError('firstName') && (
                <span className="text-red-500 text-sm mt-1">
                  {getFieldError('firstName')}
                </span>
              )}
            </div>

            <div>
              <label
                htmlFor="lastname"
                className="block text-sm font-medium text-gray-700"
              >
                Last Name
              </label>
              <input
                id="lastname"
                name="lastName"
                type="text"
                required
                value={lastName}
                onChange={(e) => {
                  setLastName(e.target.value);
                  if (getFieldError('lastName')) {
                    setValidationErrors(prev => ({...prev, lastName: ''}));
                    setServerErrors(prev => ({...prev, lastName: ''}));
                  }
                }}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                placeholder="Enter your last name"
              />
              {getFieldError('lastName') && (
                <span className="text-red-500 text-sm mt-1">
                  {getFieldError('lastName')}
                </span>
              )}
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (getFieldError('email')) {
                    setValidationErrors(prev => ({...prev, email: ''}));
                    setServerErrors(prev => ({...prev, email: ''}));
                  }
                }}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                placeholder="Enter your email"
              />
              {getFieldError('email') && (
                <span className="text-red-500 text-sm mt-1">
                  {getFieldError('email')}
                </span>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (getFieldError('password')) {
                      setValidationErrors(prev => ({...prev, password: ''}));
                      setServerErrors(prev => ({...prev, password: ''}));
                    }
                  }}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 pr-10"
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {getFieldError('password') && (
                <span className="text-red-500 text-sm">
                  {getFieldError('password')}
                </span>
              )}
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Confirm Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (getFieldError('confirmPassword')) {
                      setValidationErrors(prev => ({...prev, confirmPassword: ''}));
                      setServerErrors(prev => ({...prev, confirmPassword: ''}));
                    }
                  }}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 pr-10"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {getFieldError('confirmPassword') && (
                <span className="text-red-500 text-sm">
                  {getFieldError('confirmPassword')}
                </span>
              )}
            </div>
          </div>

          {/* Show general server errors from Redux state */}
          {error && !Object.keys(serverErrors).length && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          <div className="flex items-center">
            <input
              id="agree-terms"
              name="agree-terms"
              type="checkbox"
              required
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <label
              htmlFor="agree-terms"
              className="ml-2 block text-sm text-gray-900"
            >
              I agree to the{" "}
              <a href="#" className="text-green-600 hover:text-green-500">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-green-600 hover:text-green-500">
                Privacy Policy
              </a>
            </label>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;