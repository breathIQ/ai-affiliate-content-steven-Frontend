import Library from "../pages/user/Library"
import Login from "../pages/auth/Login"
import SignUpWithOTP from "../pages/auth/SignUpWithOTP"
import Dashboard from "../pages/Dashboard"
import FileUpload from "../pages/FileUpload"
import Users from "../pages/Users"
import UserDashboard from "../pages/user/UserDashboard"
// import UserSchedule from "../pages/user/UserSchedule"
import ViewPdf from "../pages/ViewPdf"
import UsersLabs from "../pages/UsersLabs"
import ResetPassword from "../pages/auth/ResetPassword"


const allRoutes = [
    {
        component:<Dashboard/> ,
        path:"/"
    },
    {
        component:<Dashboard/> ,
        path:"/dashboard"
    },
    {
        component:<UsersLabs/> ,
        path:"/users/labs"
    },
    {
        component:<UserDashboard/> ,
        path:"/u/dashboard"
    },
    {
        component:<UsersLabs/> ,
        path:"/u/library"
    },
    // {
    //     component:<Library/> ,
    //     path:"/u/library"
    // },
    {
        component:<ResetPassword/> ,
        path:"/reset-password"
    },
    {
        component:<ViewPdf/> ,
        path:"/pdf-view"
    },
    // {
    //     component:<UserSchedule/> ,
    //     path:"/u/schedule"
    // },
    {
        component:<FileUpload/> ,
        path:"/files"
    },
    {
        component:<Users/> ,
        path:"/users"
    },
    {
        component:<Login/> ,
        path:"/admin/login"
    },
    {
        component:<Login/> ,
        path:"/login"
    },
    {
        component:<SignUpWithOTP/> ,
        path:"/signup"
    },
]


export default allRoutes