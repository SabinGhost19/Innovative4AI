"""
Simulation State Service
Manages user sessions and monthly state persistence
"""
from sqlalchemy.orm import Session
from database import SimulationUser, SimulationSession, SimulationMonthlyState
from datetime import datetime
from typing import Optional, Dict, List
import uuid


class SimulationStateService:
    """Service for managing simulation state persistence"""
    
    @staticmethod
    def register_user(db: Session, username: str) -> Dict:
        """Register new user with username"""
        existing_user = db.query(SimulationUser).filter(
            SimulationUser.username == username
        ).first()
        
        if existing_user:
            raise ValueError(f"Username '{username}' already exists")
        
        new_user = SimulationUser(
            username=username,
            created_at=datetime.utcnow(),
            last_login=datetime.utcnow()
        )
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        return {
            "user_id": str(new_user.id),
            "username": new_user.username,
            "created_at": new_user.created_at.isoformat()
        }
    
    @staticmethod
    def login_user(db: Session, username: str) -> Dict:
        """Login user and return user data + session state"""
        user = db.query(SimulationUser).filter(
            SimulationUser.username == username
        ).first()
        
        if not user:
            raise ValueError(f"Username '{username}' not found")
        
        user.last_login = datetime.utcnow()
        db.commit()
        
        session_data = None
        if user.session:
            session = user.session
            
            latest_state = db.query(SimulationMonthlyState).filter(
                SimulationMonthlyState.session_id == session.id
            ).order_by(
                SimulationMonthlyState.year.desc(),
                SimulationMonthlyState.month.desc()
            ).first()
            
            session_data = {
                "session_id": str(session.id),
                "business_name": session.business_name,
                "business_type": session.business_type,
                "industry": session.industry,
                "location": session.location,
                "initial_budget": float(session.initial_budget),
                "current_month": session.current_month,
                "current_year": session.current_year,
                "created_at": session.created_at.isoformat(),
                "latest_state": {
                    "month": latest_state.month,
                    "year": latest_state.year,
                    "revenue": float(latest_state.revenue),
                    "profit": float(latest_state.profit),
                    "customers": latest_state.customers,
                    "cash_balance": float(latest_state.cash_balance)
                } if latest_state else None
            }
        
        return {
            "user_id": str(user.id),
            "username": user.username,
            "session": session_data
        }
    
    @staticmethod
    def create_session(
        db: Session,
        user_id: str,
        business_name: str,
        business_type: str,
        industry: str,
        location: Dict,
        initial_budget: float
    ) -> Dict:
        """Create new simulation session for user (replaces existing)"""
        user_uuid = uuid.UUID(user_id)
        
        # Delete existing session if any
        existing_session = db.query(SimulationSession).filter(
            SimulationSession.user_id == user_uuid
        ).first()
        
        if existing_session:
            db.delete(existing_session)
            db.commit()
        
        # Create new session
        new_session = SimulationSession(
            user_id=user_uuid,
            business_name=business_name,
            business_type=business_type,
            industry=industry,
            location=location,
            initial_budget=initial_budget,
            current_month=1,
            current_year=2024
        )
        
        db.add(new_session)
        db.commit()
        db.refresh(new_session)
        
        return {
            "session_id": str(new_session.id),
            "user_id": str(new_session.user_id),
            "business_name": new_session.business_name,
            "current_month": new_session.current_month,
            "current_year": new_session.current_year
        }
    
    @staticmethod
    def save_monthly_state(
        db: Session,
        session_id: str,
        month: int,
        year: int,
        revenue: float,
        profit: float,
        customers: int,
        cash_balance: float,
        agent_outputs: Dict,
        player_decisions: Dict
    ) -> Dict:
        """Save state for a specific month"""
        session_uuid = uuid.UUID(session_id)
        
        # Check if state already exists
        existing_state = db.query(SimulationMonthlyState).filter(
            SimulationMonthlyState.session_id == session_uuid,
            SimulationMonthlyState.month == month,
            SimulationMonthlyState.year == year
        ).first()
        
        if existing_state:
            # Update existing
            existing_state.revenue = revenue
            existing_state.profit = profit
            existing_state.customers = customers
            existing_state.cash_balance = cash_balance
            existing_state.market_context = agent_outputs.get('marketContext')
            existing_state.events_data = agent_outputs.get('eventsData')
            existing_state.trends_data = agent_outputs.get('trendsData')
            existing_state.supplier_data = agent_outputs.get('supplierData')
            existing_state.competition_data = agent_outputs.get('competitionData')
            existing_state.employee_data = agent_outputs.get('employeeData')
            existing_state.customer_data = agent_outputs.get('customerData')
            existing_state.financial_data = agent_outputs.get('financialData')
            existing_state.player_decisions = player_decisions
            
            db.commit()
            db.refresh(existing_state)
            state = existing_state
        else:
            # Create new
            new_state = SimulationMonthlyState(
                session_id=session_uuid,
                month=month,
                year=year,
                revenue=revenue,
                profit=profit,
                customers=customers,
                cash_balance=cash_balance,
                market_context=agent_outputs.get('marketContext'),
                events_data=agent_outputs.get('eventsData'),
                trends_data=agent_outputs.get('trendsData'),
                supplier_data=agent_outputs.get('supplierData'),
                competition_data=agent_outputs.get('competitionData'),
                employee_data=agent_outputs.get('employeeData'),
                customer_data=agent_outputs.get('customerData'),
                financial_data=agent_outputs.get('financialData'),
                player_decisions=player_decisions
            )
            
            db.add(new_state)
            db.commit()
            db.refresh(new_state)
            state = new_state
        
        # Update session's current month
        session = db.query(SimulationSession).filter(
            SimulationSession.id == session_uuid
        ).first()
        
        if session:
            session.current_month = month
            session.current_year = year
            session.updated_at = datetime.utcnow()
            db.commit()
        
        return {
            "state_id": state.id,
            "month": state.month,
            "year": state.year,
            "saved_at": state.created_at.isoformat()
        }
    
    @staticmethod
    def get_previous_state(db: Session, session_id: str, current_month: int, current_year: int) -> Optional[Dict]:
        """Get state from previous month"""
        session_uuid = uuid.UUID(session_id)
        
        # Calculate previous month
        if current_month == 1:
            prev_month = 12
            prev_year = current_year - 1
        else:
            prev_month = current_month - 1
            prev_year = current_year
        
        state = db.query(SimulationMonthlyState).filter(
            SimulationMonthlyState.session_id == session_uuid,
            SimulationMonthlyState.month == prev_month,
            SimulationMonthlyState.year == prev_year
        ).first()
        
        if not state:
            return None
        
        return {
            "revenue": float(state.revenue),
            "profit": float(state.profit),
            "customers": state.customers,
            "cashBalance": float(state.cash_balance)
        }
    
    @staticmethod
    def get_session_history(db: Session, session_id: str) -> List[Dict]:
        """Get all monthly states for a session"""
        session_uuid = uuid.UUID(session_id)
        
        states = db.query(SimulationMonthlyState).filter(
            SimulationMonthlyState.session_id == session_uuid
        ).order_by(
            SimulationMonthlyState.year.asc(),
            SimulationMonthlyState.month.asc()
        ).all()
        
        return [{
            "month": state.month,
            "year": state.year,
            "revenue": float(state.revenue),
            "profit": float(state.profit),
            "customers": state.customers,
            "cash_balance": float(state.cash_balance),
            "created_at": state.created_at.isoformat()
        } for state in states]
