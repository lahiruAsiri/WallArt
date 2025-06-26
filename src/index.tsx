import { createRoot } from "react-dom/client"
import { App } from "./App.tsx"

//@ts-ignore
const root = createRoot(document.getElementById("root"))
root.render(<App/>)
