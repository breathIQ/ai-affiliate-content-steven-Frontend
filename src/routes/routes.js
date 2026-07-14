import Library from "../pages/user/Library"
import Login from "../pages/auth/Login"
import SignUpWithOTP from "../pages/auth/SignUpWithOTP"
import Dashboard from "../pages/Dashboard"
import Stats from "../pages/Stats"
import FileUpload from "../pages/FileUpload"
import Users from "../pages/Users"
import UserDashboard from "../pages/user/UserDashboard"
// import UserSchedule from "../pages/user/UserSchedule"
import ViewPdf from "../pages/ViewPdf"
import UsersLabs from "../pages/UsersLabs"
import ResetPassword from "../pages/auth/ResetPassword"
import NotFound from "../pages/NotFound"
import Privacy from "../pages/common/Privacy"
import Terms from "../pages/common/Terms"
import AffiliateUserLandingPage from "../pages/AffiliateUserLandingPage"
import Billing from "../pages/user/Billing"
import Avatars from "../pages/user/Avatars"
import CampaignReviewQueue from "../pages/admin/CampaignReviewQueue"
import CampaignContent from "../pages/admin/CampaignContent"
import CampaignPostPreview from "../pages/user/CampaignPostPreview"
import Automations from "../pages/user/Automations"
import ApiBalances from "../pages/admin/ApiBalances"


const allRoutes = [
    // PUBLIC ROUTES
    { component: <Login />, path: "/login", role: "public" },
    { component: <Login />, path: "/admin/login", role: "public" },
    { component: <SignUpWithOTP />, path: "/signup", role: "public" },
    {
        component:<ResetPassword/> ,
        path:"/reset-password",
        role: ""
    },
    {
        component:<Terms/> ,
        path:"/terms",
        role: "public"
    },
    {
        component:<Privacy/> ,
        path:"/privacy",
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
    { component: <Stats />, path: "/admin/stats", role: 2 },
    { component: <ApiBalances />, path: "/admin/api-balances", role: 2 },
    { component: <Users />, path: "/admin/users", role: 2 },
    { component: <FileUpload />, path: "/admin/files", role: 2 },
    { component: <CampaignReviewQueue />, path: "/admin/campaign-review", role: 2 },
    { component: <CampaignContent />, path: "/admin/campaign-content", role: 2 },

    // USER ROUTES
    { component: <UserDashboard />, path: "/u/dashboard", role: 1 },
    { component: <Billing />, path: "/u/billing", role: 1 },
    { component: <Avatars />, path: "/u/avatars", role: 1 },
    { component: <Automations />, path: "/u/automations", role: 1 },
    { component: <Automations />, path: "/admin/automations", role: 2 },
    { component: <UsersLabs />, path: "/u/library", role: "public"},
    { component: <UsersLabs />, path: "/admin/library", role: "public"},
    // { component: <UsersLabs />, path: "/u/library", role: 2 },
    { component: <UsersLabs />, path: "/library", role: 2 },
    { component: <Library />, path: "/u/post/view/:id", role: 1 },
    { component: <Library />, path: "/admin/u/post/view/:id", role: 2 },
    { component: <CampaignPostPreview />, path: "/u/campaign-post/:id", role: 1 },
    { component: <CampaignPostPreview />, path: "/admin/campaign-post/:id", role: 2 },
    // { component: <Library />, path: "/u/post/view/:id", role: 2 },

    { component: <AffiliateUserLandingPage />, path: "/:affiliateId", role: "public" },

    // COMMON/NOT FOUND
    { component: <NotFound />, path: "/*", role: "public" },
];


export default allRoutes