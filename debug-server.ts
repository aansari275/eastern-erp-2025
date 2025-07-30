// Quick debug script to test server startup issues
import path from "path";

console.log("🔧 Debug Server Paths");
console.log("Current working directory:", process.cwd()); 
console.log("__dirname equivalent:", import.meta.dirname);
console.log("Expected client path:", path.resolve(process.cwd(), "client"));
console.log("Expected main.tsx path:", path.resolve(process.cwd(), "client", "src", "main.tsx"));

// Check if files exist
import fs from "fs";
const clientPath = path.resolve(process.cwd(), "client");
const mainTsxPath = path.resolve(process.cwd(), "client", "src", "main.tsx"); 
const indexHtmlPath = path.resolve(process.cwd(), "client", "index.html");

console.log("Client directory exists:", fs.existsSync(clientPath));
console.log("main.tsx exists:", fs.existsSync(mainTsxPath));
console.log("index.html exists:", fs.existsSync(indexHtmlPath));