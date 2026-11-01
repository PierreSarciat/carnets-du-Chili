import { Outlet } from 'react-router-dom';
import Navbar from './Navbar/Navbar';
import Footer from './Footer/Footer';
import ScrollToTop from "@/components/ScrollToTop";
import './Layout.scss';

export default function Layout() {
    return (
        <div >
            <ScrollToTop />
            <Navbar />
            <main >
                <Outlet />
            </main>
            <Footer />
        </div>
    );
}