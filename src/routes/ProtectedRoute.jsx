import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, role }) => {
  // 1. If user is not logged in
  
  const user = localStorage.getItem("user")
  ? JSON.parse(localStorage.getItem("user"))
  : {};
  if (!user) {
      return <Navigate to="/login" replace />;
    }
    
    // 2. If user is logged in but trying to access a route they aren't allowed to
    // (e.g., a "user" trying to access an "admin" route)
    // console.log(user , Number(user.role_id) ,role );
  if (Number(user.role_id) !== role) {
      return children;
    }else{
      return <Navigate to={Number(user.role_id) == 1 ? "/admin/dashboard" : "/u/dashboard"} replace />;
  }

};

export default ProtectedRoute;