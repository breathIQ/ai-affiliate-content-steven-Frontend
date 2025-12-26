import Dashboard from "../pages/Dashboard"
import FileUpload from "../pages/FileUpload"
import Users from "../pages/Users"


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
        component:<FileUpload/> ,
        path:"/files"
    },
    {
        component:<Users/> ,
        path:"/users"
    },
]


export default allRoutes