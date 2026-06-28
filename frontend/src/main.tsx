import { createRoot } from "react-dom/client";
import AppRouter from "./app/router.tsx";
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(<AppRouter />);
