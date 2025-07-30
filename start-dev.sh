#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Eastern ERP Development Server Startup${NC}"
echo "========================================"

# Function to kill processes on ports
kill_port() {
    local port=$1
    echo -e "${YELLOW}🔍 Checking port $port...${NC}"
    
    # Find processes using the port
    pids=$(lsof -ti:$port 2>/dev/null)
    
    if [ ! -z "$pids" ]; then
        echo -e "${YELLOW}⚠️  Port $port is in use. Killing processes: $pids${NC}"
        echo $pids | xargs kill -9 2>/dev/null
        sleep 2
        echo -e "${GREEN}✅ Port $port cleared${NC}"
    else
        echo -e "${GREEN}✅ Port $port is available${NC}"
    fi
}

# Function to check if Firebase credentials exist
check_firebase() {
    if [ -f "server/serviceAccountKey.json" ]; then
        echo -e "${GREEN}✅ Firebase service account found${NC}"
        return 0
    else
        echo -e "${RED}❌ Firebase service account not found${NC}"
        echo -e "${YELLOW}💡 Please add your Firebase service account key to server/serviceAccountKey.json${NC}"
        return 1
    fi
}

# Function to install dependencies if needed
check_dependencies() {
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}📦 Installing dependencies...${NC}"
        npm install
    else
        echo -e "${GREEN}✅ Dependencies already installed${NC}"
    fi
}

# Function to start the server with auto-restart
start_server() {
    echo -e "${BLUE}🌟 Starting Eastern ERP Server...${NC}"
    echo ""
    echo -e "${GREEN}🌐 Frontend will be available at: http://localhost:3000${NC}"
    echo -e "${GREEN}🔗 API will be available at: http://localhost:5000/api${NC}"
    echo ""
    echo -e "${YELLOW}💡 Press Ctrl+C to stop the server${NC}"
    echo -e "${YELLOW}💡 The server will auto-restart on file changes${NC}"
    echo ""
    echo "========================================"
    
    # Check if nodemon is available locally
    if [ -f "node_modules/.bin/nodemon" ]; then
        echo -e "${BLUE}Using local nodemon for auto-restart...${NC}"
        ./node_modules/.bin/nodemon --exec tsx server/index.ts --ext ts,js,json --ignore dist/ --ignore node_modules/
    elif command -v nodemon &> /dev/null; then
        echo -e "${BLUE}Using global nodemon for auto-restart...${NC}"
        nodemon --exec tsx server/index.ts --ext ts,js,json --ignore dist/ --ignore node_modules/
    else
        echo -e "${BLUE}Installing nodemon locally for better development experience...${NC}"
        npm install --save-dev nodemon
        if [ -f "node_modules/.bin/nodemon" ]; then
            ./node_modules/.bin/nodemon --exec tsx server/index.ts --ext ts,js,json --ignore dist/ --ignore node_modules/
        else
            echo -e "${YELLOW}Falling back to tsx without auto-restart...${NC}"
            tsx server/index.ts
        fi
    fi
}

# Main execution
main() {
    echo -e "${BLUE}🔧 Pre-flight checks...${NC}"
    echo ""
    
    # Clear ports
    kill_port 3000
    kill_port 5000
    kill_port 5001
    
    echo ""
    
    # Check dependencies
    check_dependencies
    
    echo ""
    
    # Check Firebase
    if ! check_firebase; then
        echo -e "${RED}⚠️  Firebase setup required but continuing anyway...${NC}"
        echo ""
    fi
    
    echo -e "${GREEN}🎯 All checks complete!${NC}"
    echo ""
    
    # Start server
    start_server
}

# Handle script interruption
trap 'echo -e "\n${YELLOW}🛑 Shutting down server...${NC}"; kill_port 3000; kill_port 5000; kill_port 5001; exit 0' INT

# Run main function
main