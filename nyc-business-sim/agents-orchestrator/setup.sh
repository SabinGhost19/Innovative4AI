#!/bin/bash

# Culori pentru output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Agents Orchestrator - Setup Script      ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"
echo ""

# Check Node.js
echo -e "${YELLOW}Verificare Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "❌ Node.js nu este instalat. Te rog instalează Node.js 18+ mai întâi."
    exit 1
fi

NODE_VERSION=$(node -v)
echo -e "${GREEN}✓${NC} Node.js detectat: $NODE_VERSION"

# Instalare dependențe
echo ""
echo -e "${YELLOW}Instalare dependențe...${NC}"
npm install

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} Dependențe instalate cu succes!"
else
    echo -e "❌ Eroare la instalarea dependențelor"
    exit 1
fi

# Verificare .env.local
echo ""
echo -e "${YELLOW}Verificare configurare...${NC}"
if [ -f ".env.local" ]; then
    echo -e "${GREEN}✓${NC} .env.local găsit"
else
    echo -e "❌ .env.local lipsește!"
    exit 1
fi

# Success
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✓ Setup complet!                         ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════╝${NC}"
echo ""
echo -e "Pentru a porni serverul:"
echo -e "${BLUE}npm run dev${NC}"
echo ""
echo -e "Server va porni pe: ${BLUE}http://localhost:3000${NC}"
echo -e "API endpoint: ${BLUE}http://localhost:3000/api/recommend-business${NC}"
echo ""
