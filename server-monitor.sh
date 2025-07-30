#!/bin/bash

# Server health monitor for Eastern ERP
# This script checks server health and auto-restarts if needed

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

FRONTEND_URL="http://localhost:3000"
API_URL="http://localhost:5000/api/rugs"
LOG_FILE="logs/monitor.log"

# Create logs directory if it doesn't exist
mkdir -p logs

log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> $LOG_FILE
    echo -e "$1"
}

check_server_health() {
    local url=$1
    local service_name=$2
    
    # Check if URL is reachable
    if curl -s --connect-timeout 5 --max-time 10 "$url" > /dev/null 2>&1; then
        log_message "${GREEN}✅ $service_name is healthy${NC}"
        return 0
    else
        log_message "${RED}❌ $service_name is down${NC}"
        return 1
    fi
}

restart_server() {
    log_message "${YELLOW}🔄 Attempting to restart server...${NC}"
    
    # Kill existing processes
    ./quick-start.sh > /dev/null 2>&1 &
    
    # Wait for startup
    sleep 10
    
    # Check if restart was successful
    if check_server_health $FRONTEND_URL "Frontend" && check_server_health $API_URL "API"; then
        log_message "${GREEN}✅ Server restart successful${NC}"
        return 0
    else
        log_message "${RED}❌ Server restart failed${NC}"
        return 1
    fi
}

main_monitor_loop() {
    log_message "${BLUE}🔍 Starting Eastern ERP health monitor...${NC}"
    
    while true; do
        frontend_healthy=false
        api_healthy=false
        
        # Check frontend
        if check_server_health $FRONTEND_URL "Frontend"; then
            frontend_healthy=true
        fi
        
        # Check API
        if check_server_health $API_URL "API"; then
            api_healthy=true
        fi
        
        # If either service is down, restart
        if [ "$frontend_healthy" = false ] || [ "$api_healthy" = false ]; then
            log_message "${YELLOW}⚠️  One or more services are down. Initiating restart...${NC}"
            
            if restart_server; then
                log_message "${GREEN}🎉 Services restored${NC}"
            else
                log_message "${RED}💀 Critical: Unable to restore services. Manual intervention required.${NC}"
                # Send notification (you could add email/Slack notification here)
            fi
        fi
        
        # Wait before next check (every 30 seconds)
        sleep 30
    done
}

# Handle script interruption
trap 'log_message "${YELLOW}🛑 Monitor stopped${NC}"; exit 0' INT

# Start monitoring if this script is run directly
if [ "${BASH_SOURCE[0]}" == "${0}" ]; then
    main_monitor_loop
fi