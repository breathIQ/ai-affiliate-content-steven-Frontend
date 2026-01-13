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
import NotFound from "../pages/NotFound"


// const allRoutes = [
//     {
//         component:<Dashboard/> ,
//         path:"/"
//     },
//     {
//         component:<Dashboard/> ,
//         path:"/dashboard"
//     },
   
//     {
//         component:<UserDashboard/> ,
//         path:"/u/dashboard"
//     },
//     {
//         component:<UsersLabs/> ,
//         path:"/u/library"
//     },
//     {
//         component:<Library/> ,
//         path:"/u/post/view/:id"
//     },
//     {
//         component:<ResetPassword/> ,
//         path:"/reset-password"
//     },
//     {
//         component:<ViewPdf/> ,
//         path:"/pdf-view"
//     },
//     {
//         component:<NotFound/> ,
//         path:"/*"
//     },
//     {
//         component:<FileUpload/> ,
//         path:"/files"
//     },
//     {
//         component:<Users/> ,
//         path:"/users"
//     },
//     {
//         component:<Login/> ,
//         path:"/admin/login"
//     },
//     {
//         component:<Login/> ,
//         path:"/login"
//     },
//     {
//         component:<SignUpWithOTP/> ,
//         path:"/signup"
//     },
// ]

const allRoutes = [
    // PUBLIC ROUTES
    { component: <Login />, path: "/login", role: "public" },
    { component: <Login />, path: "/admin/login", role: "public" },
    { component: <SignUpWithOTP />, path: "/signup", role: "public" },
    {
        component:<ResetPassword/> ,
        path:"/reset-password",
        role: "public"
    },
    {
        component:<ViewPdf/> ,
        path:"/pdf-view",role: 1
    },

    // ADMIN ROUTES
    { component: <Dashboard />, path: "/", role: 2 },
    { component: <Dashboard />, path: "/admin", role: 2 },
    { component: <Dashboard />, path: "/admin/dashboard", role: 2 },
    { component: <Users />, path: "/admin/users", role: 2 },
    { component: <FileUpload />, path: "/admin/files", role: 2 },

    // USER ROUTES
    { component: <UserDashboard />, path: "/u/dashboard", role: 1 },
    { component: <UsersLabs />, path: "/u/library", role: "public"},
    { component: <UsersLabs />, path: "/admin/library", role: "public"},
    // { component: <UsersLabs />, path: "/u/library", role: 2 },
    { component: <UsersLabs />, path: "/library", role: 2 },
    { component: <Library />, path: "/u/post/view/:id", role: "public" },
    { component: <Library />, path: "/admin/u/post/view/:id", role: "public" },
    // { component: <Library />, path: "/u/post/view/:id", role: 2 },

    // COMMON/NOT FOUND
    { component: <NotFound />, path: "/*", role: "public" },
];


export default allRoutes