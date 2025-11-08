#!/bin/bash

# Interactive E2E Test Selection Script
# Allows you to choose which Cypress test to run

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}"
echo "╔════════════════════════════════════════════════════════╗"
echo "║         🎭 Cypress E2E Test Runner                    ║"
echo "╚════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Get list of test files
CYPRESS_DIR="cypress/e2e"
TEST_FILES=($(find "$CYPRESS_DIR" -name "*.cy.ts" | sort))

if [ ${#TEST_FILES[@]} -eq 0 ]; then
    echo -e "${RED}❌ No test files found in $CYPRESS_DIR${NC}"
    exit 1
fi

# Function to display menu
display_menu() {
    echo -e "${BLUE}Available E2E Tests:${NC}"
    echo ""
    
    # Add option to run all tests
    echo -e "${GREEN}0)${NC} ${YELLOW}Run ALL tests${NC}"
    echo -e "${GREEN}00)${NC} ${YELLOW}Open Cypress UI (interactive)${NC}"
    echo ""
    
    # Display individual test files
    for i in "${!TEST_FILES[@]}"; do
        TEST_NAME=$(basename "${TEST_FILES[$i]}" .cy.ts)
        # Add descriptions based on test name
        case $TEST_NAME in
            "admin-journey")
                DESC="Admin user workflow"
                ;;
            "teacher-journey")
                DESC="Teacher user workflow"
                ;;
            "student-journey")
                DESC="Student user workflow"
                ;;
            "user-journeys")
                DESC="All user role workflows"
                ;;
            "auth")
                DESC="Authentication flows"
                ;;
            "smoke")
                DESC="Basic smoke tests"
                ;;
            *)
                DESC="E2E test suite"
                ;;
        esac
        echo -e "${GREEN}$((i+1)))${NC} ${TEST_NAME} ${CYAN}- $DESC${NC}"
    done
    
    echo ""
    echo -e "${GREEN}q)${NC} Quit"
    echo ""
}

# Function to check if dev server is running
check_server() {
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Development server is running${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠️  Development server not detected${NC}"
        return 1
    fi
}

# Function to check if database is running
check_database() {
    if curl -s http://127.0.0.1:54321/rest/v1/ > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Supabase database is running${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠️  Supabase database not detected${NC}"
        return 1
    fi
}

# Function to run a specific test
run_test() {
    local test_file=$1
    local test_name=$(basename "$test_file" .cy.ts)
    
    echo ""
    echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}Running: ${test_name}${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
    echo ""
    
    # Check prerequisites
    check_database
    DB_RUNNING=$?
    
    check_server
    SERVER_RUNNING=$?
    
    echo ""
    
    if [ $SERVER_RUNNING -ne 0 ] || [ $DB_RUNNING -ne 0 ]; then
        echo -e "${YELLOW}Would you like to:${NC}"
        echo -e "1) Start services automatically (recommended)"
        echo -e "2) Run test anyway (may fail)"
        echo -e "3) Cancel"
        echo -n "Choose [1/2/3]: "
        read -r choice
        
        case $choice in
            1)
                echo -e "${BLUE}Starting services and running test...${NC}"
                npm run seed:test-user && \
                start-server-and-test './scripts/dev-server.sh start all' http://localhost:3000 \
                "cypress run --spec $test_file"
                return $?
                ;;
            2)
                echo -e "${YELLOW}Running test without starting services...${NC}"
                cypress run --spec "$test_file"
                return $?
                ;;
            3)
                echo -e "${RED}Test cancelled${NC}"
                return 1
                ;;
            *)
                echo -e "${RED}Invalid choice. Test cancelled.${NC}"
                return 1
                ;;
        esac
    else
        # Services are running, just run the test
        cypress run --spec "$test_file"
        return $?
    fi
}

# Function to run all tests
run_all_tests() {
    echo ""
    echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}Running ALL E2E tests${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
    echo ""
    
    # Check prerequisites
    check_database
    DB_RUNNING=$?
    
    check_server
    SERVER_RUNNING=$?
    
    echo ""
    
    if [ $SERVER_RUNNING -ne 0 ] || [ $DB_RUNNING -ne 0 ]; then
        echo -e "${BLUE}Starting services and running all tests...${NC}"
        npm run e2e:db
    else
        cypress run
    fi
}

# Function to open Cypress UI
open_cypress_ui() {
    echo ""
    echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}Opening Cypress Interactive UI${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
    echo ""
    
    # Check prerequisites
    check_database
    DB_RUNNING=$?
    
    check_server
    SERVER_RUNNING=$?
    
    echo ""
    
    if [ $SERVER_RUNNING -ne 0 ] || [ $DB_RUNNING -ne 0 ]; then
        echo -e "${BLUE}Starting services and opening Cypress UI...${NC}"
        npm run e2e:open
    else
        cypress open
    fi
}

# Main loop
while true; do
    display_menu
    
    echo -n "Select test to run [0-${#TEST_FILES[@]}/00/q]: "
    read -r choice
    
    case $choice in
        0)
            run_all_tests
            RESULT=$?
            echo ""
            if [ $RESULT -eq 0 ]; then
                echo -e "${GREEN}✅ All tests completed successfully${NC}"
            else
                echo -e "${RED}❌ Some tests failed${NC}"
            fi
            echo ""
            echo -n "Press Enter to continue..."
            read -r
            ;;
        00)
            open_cypress_ui
            echo ""
            echo -n "Press Enter to continue..."
            read -r
            ;;
        q|Q)
            echo -e "${CYAN}Goodbye! 👋${NC}"
            exit 0
            ;;
        *)
            if [[ "$choice" =~ ^[0-9]+$ ]] && [ "$choice" -ge 1 ] && [ "$choice" -le "${#TEST_FILES[@]}" ]; then
                TEST_INDEX=$((choice - 1))
                run_test "${TEST_FILES[$TEST_INDEX]}"
                RESULT=$?
                echo ""
                if [ $RESULT -eq 0 ]; then
                    echo -e "${GREEN}✅ Test completed successfully${NC}"
                else
                    echo -e "${RED}❌ Test failed${NC}"
                fi
                echo ""
                echo -n "Press Enter to continue..."
                read -r
            else
                echo -e "${RED}Invalid choice. Please try again.${NC}"
                sleep 1
            fi
            ;;
    esac
    
    # Clear screen for next iteration
    clear
done
