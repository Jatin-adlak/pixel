import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom"

import Home from "./pages/Home"
import Feed from "./pages/Feed"
import Login from "./pages/Login"
import Newsletter from "./pages/Newsletter"
import Profile from "./pages/Profile"
import Gallery from "./pages/Gallery"
import EventGallery from "./pages/EventGallery"
import ImageViewer from "./pages/ImageViewer"
import FaceSetup from "./components/FaceSetup"
import FaceFilter from "./components/FaceFilter"
import UsernameSetup from "./pages/UsernameSetup"
import Navbar from "./components/Navbar"
import CustomCursor from "./components/CustomCursor"
import ThemeToggle from "./components/ThemeToggle"
import PublicProfile from "./pages/PublicProfile"
import Moments from "./pages/Moments"
import Spotlight from "./pages/Spotlight"

/* 🔥 ADD THESE */
import Admin from "./pages/Admin"
import ManageData from "./components/ManageData"

function Layout() {

  const location = useLocation()
  const hideNavbar = location.pathname === "/login"

  return (
    <>
      <CustomCursor />

      {!hideNavbar && <Navbar />}
      <ThemeToggle />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/newsletter" element={<Newsletter />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/gallery/:id" element={<EventGallery />} />
        <Route path="/face-setup" element={<FaceSetup />} />
        <Route path="/face-filter" element={<FaceFilter />} />
        <Route path="/username" element={<UsernameSetup />} />

        {/* 🔥 ADD THESE ROUTES */}
        <Route path="/admin" element={<Admin />} />
        <Route path="/manage" element={<ManageData />} />
        <Route path="/user/:email" element={<PublicProfile />} />

        <Route path="/moments" element={<Moments />} />

        <Route path="/spotlight" element={<Spotlight/>} />
        
      </Routes>
    </>
  )
}

function App() {
  return (
    <Router>
      <Layout />
    </Router>
  )
}

export default App