import React, { useState, useCallback } from "react";
import { TextField, Button, Container, Typography, Grid, MenuItem, Select, InputLabel, FormControl, FormHelperText } from "@mui/material";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Define the form data types
interface AuthFormData {
  email: string;
  password: string;
  name?: string;
  role?: string;
  userAddress?: string;
}

const TOKEN_KEY = "refine-auth-token";
const API_URL = "http://127.0.0.1:8000"; // Your API URL

// AuthPage Component
interface AuthPageProps {
  type: "login" | "register";
}

const AuthPage: React.FC<AuthPageProps> = ({ type }) => {
  const { register, handleSubmit, formState: { errors }, watch } = useForm<AuthFormData>();
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate(); // useNavigate hook should be used here

  // Define the handleLogin function using useCallback hook
  const handleLogin = useCallback(async (email: string, password: string) => {
    try {
      // Make the POST request to the backend
      const response = await axios.post<{ access_token: string; token_type: string;}>(
        `${API_URL}/login/`,
        { email, password }
      );

      // Extract the access token
      const { access_token } = response.data;

      if (access_token) {
        // Save the access token to localStorage
        localStorage.setItem(TOKEN_KEY, access_token);
      
        try {
          // Decode the JWT payload
          const decodedToken = JSON.parse(atob(access_token.split(".")[1]));
          const userRole = decodedToken?.role;
          const userId = decodedToken?.iduser;
      
          // Save the user role and ID to localStorage
          if (userRole && userId) {
            localStorage.setItem("userRole", userRole);
            localStorage.setItem("userId", userId);

            // Redirect based on the user role
            if (userRole === "admin") {
              navigate("/admin-dashboard"); // Redirect to admin dashboard
            } else {
              window.location.replace("/");
               // Redirect to user dashboard
            }
          } else {
            setError("Role not found in the token.");
          }
        } catch (error) {
          setError("Invalid token format.");
          console.error("Error decoding token:", error);
        }
      } else {
        setError("Access token is missing.");
      }
      
    } catch (error) {
      setError("Login failed. Please check your credentials.");
    }
  }, [navigate]);

  // Define the handleRegister function
  const handleRegister = useCallback(async (email: string, password: string, name: string, role: string, userAddress: string) => {
    try {
      const response = await axios.post<{ status: string }>(`${API_URL}/add_user/`, { email, password, name, role, userAddress });

      if (response.data.status === "success") {
        // After successful registration, auto-login the user
        await handleLogin(email, password);
      }
    } catch (error) {
      setError("Registration failed. Please try again.");
    }
  }, [handleLogin]);

  const onSubmit = (data: AuthFormData) => {
    if (type === "login") {
      handleLogin(data.email, data.password);
    } else {
      handleRegister(data.email, data.password, data.name!, data.role!, data.userAddress!);
    }
  };

  return (
    <div
    style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh', // Full height of the viewport
      backgroundColor: '#f0f0f0', // Optional background color for the page
    }}
  >
    <Container component="main" maxWidth="xs" sx={{ paddingTop: 4, backgroundColor: "#f9f9f9", borderRadius: 2, boxShadow: 3, paddingBottom: 4 }}>
    <Typography variant="h4" component="h1" align="center" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
      {type === "login" ? "Login" : "Register"}
    </Typography>
    <form onSubmit={handleSubmit(onSubmit)}>
      <TextField
        {...register("email", { required: "Email is required" })}
        label="Email"
        fullWidth
        margin="normal"
        error={!!errors.email}
        helperText={errors.email ? String(errors.email.message) : ""}
      />
      <TextField
        {...register("password", { required: "Password is required" })}
        label="Password"
        type="password"
        fullWidth
        margin="normal"
        error={!!errors.password}
        helperText={errors.password ? String(errors.password.message) : ""}
      />
      {type === "register" && (
        <>
          <TextField
            {...register("name", { required: "Name is required" })}
            label="Full Name"
            fullWidth
            margin="normal"
            error={!!errors.name}
            helperText={errors.name ? String(errors.name.message) : ""}
          />
          <FormControl fullWidth margin="normal" error={!!errors.role} sx={{ backgroundColor: '#fff' }}>
            <InputLabel>Role</InputLabel>
            <Select {...register("role", { required: "Role is required" })} label="Role">
              <MenuItem value="Raw_Material">Raw Material</MenuItem>
              <MenuItem value="Manufacture">Manufacture</MenuItem>
              <MenuItem value="Distribution">Distribution</MenuItem>
              <MenuItem value="Customer">Customer</MenuItem>
            </Select>
            {errors.role && <FormHelperText>{errors.role.message}</FormHelperText>}
          </FormControl>
          <TextField
            {...register("userAddress")}
            label="User Address"
            fullWidth
            margin="normal"
          />
        </>
      )}
      {error && <Typography color="error" sx={{ textAlign: "center", marginTop: 1, fontSize: "0.875rem" }}>{error}</Typography>}
      <Button type="submit" variant="contained" color="primary" fullWidth sx={{
        marginTop: 2,
        '&:hover': {
          backgroundColor: '#1565c0', // Darker shade for hover effect
        }
      }}>
        {type === "login" ? "Login" : "Register"}
      </Button>
    </form>
    <Grid container justifyContent="center" sx={{ marginTop: 2 }}>
      <Grid item>
        {type === "login" ? (
          <Link to="/register" style={{ textDecoration: 'none', color: '#1976d2' }}>
            Don't have an account? Register
          </Link>
        ) : (
          <Link to="/login" style={{ textDecoration: 'none', color: '#1976d2' }}>
            Already have an account? Login
          </Link>
        )}
      </Grid>
    </Grid>
  </Container>
  </div>
  
  );
};

export default AuthPage;
