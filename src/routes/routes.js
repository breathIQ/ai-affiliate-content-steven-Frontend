import Library from "../pages/user/Library"
import Login from "../pages/auth/Login"
import SignUpWithOTP from "../pages/auth/SignUpWithOTP"
import Dashboard from "../pages/Dashboard"
import FileUpload from "../pages/FileUpload"
import Users from "../pages/Users"
import UserDashboard from "../pages/user/UserDashboard"
import UserSchedule from "../pages/user/UserSchedule"
import ViewPdf from "../pages/ViewPdf"


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
        component:<UserDashboard/> ,
        path:"/u/dashboard"
    },
    {
        component:<Library/> ,
        path:"/u/library"
    },
    {
        component:<ViewPdf/> ,
        path:"/pdf-view"
    },
    {
        component:<UserSchedule/> ,
        path:"/u/schedule"
    },
    {
        component:<FileUpload/> ,
        path:"/u/files"
    },
    {
        component:<Users/> ,
        path:"/u/users"
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