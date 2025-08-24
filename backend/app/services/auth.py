from datetime import datetime, timedelta
from typing import Optional, Union
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.core.config import settings
from app.models.user import User, UserRole, RefreshToken, UserSession
from app.schemas.auth import TokenData
from app.core.database import get_db
import secrets

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT token security
security = HTTPBearer()

class AuthService:
    def __init__(self):
        self.secret_key = settings.JWT_SECRET_KEY
        self.algorithm = settings.JWT_ALGORITHM
        self.access_token_expire_minutes = settings.ACCESS_TOKEN_EXPIRE_MINUTES
        self.refresh_token_expire_days = settings.REFRESH_TOKEN_EXPIRE_DAYS
    
    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verify a password against its hash"""
        return pwd_context.verify(plain_password, hashed_password)
    
    def get_password_hash(self, password: str) -> str:
        """Generate password hash"""
        return pwd_context.hash(password)
    
    def create_access_token(self, data: dict, expires_delta: Optional[timedelta] = None) -> str:
        """Create JWT access token"""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=self.access_token_expire_minutes)
        
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)
        return encoded_jwt
    
    def create_refresh_token(self, user_id: int) -> str:
        """Create refresh token"""
        return secrets.token_urlsafe(32)
    
    def verify_token(self, token: str) -> TokenData:
        """Verify JWT token and return token data"""
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            username: str = payload.get("sub")
            user_id: int = payload.get("user_id")
            role: str = payload.get("role")
            
            if username is None or user_id is None:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Could not validate credentials",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            
            token_data = TokenData(username=username, user_id=user_id, role=UserRole(role))
            return token_data
        except JWTError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
    
    async def authenticate_user(self, db: AsyncSession, username: str, password: str) -> Optional[User]:
        """Authenticate user with username and password"""
        # Get user from database
        result = await db.execute(select(User).where(User.username == username))
        user = result.scalar_one_or_none()
        
        if not user:
            return None
        
        if not self.verify_password(password, user.hashed_password):
            return None
        
        if not user.is_active:
            return None
        
        return user
    
    async def get_current_user(
        self, 
        db: AsyncSession = Depends(get_db),
        credentials: HTTPAuthorizationCredentials = Depends(security)
    ) -> User:
        """Get current authenticated user"""
        token = credentials.credentials
        token_data = self.verify_token(token)
        
        # Get user from database
        result = await db.execute(select(User).where(User.id == token_data.user_id))
        user = result.scalar_one_or_none()
        
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Inactive user"
            )
        
        return user
    
    async def get_current_active_user(self, current_user: User = Depends(get_current_user)) -> User:
        """Get current active user"""
        if not current_user.is_active:
            raise HTTPException(status_code=400, detail="Inactive user")
        return current_user
    
    def check_permission(self, user: User, resource: str, action: str) -> bool:
        """Check if user has permission for resource and action"""
        # Define role-based permissions
        role_permissions = {
            UserRole.MANAGEMENT: {
                "dashboard": ["read", "write"],
                "system-health": ["read", "write"],
                "performance": ["read", "write"],
                "alerts": ["read", "write"],
                "users": ["read", "write"],
                "settings": ["read", "write"]
            },
            UserRole.DEVOPS: {
                "dashboard": ["read"],
                "system-health": ["read", "write"],
                "performance": ["read", "write"],
                "alerts": ["read", "write"],
                "settings": ["read"]
            },
            UserRole.QA: {
                "dashboard": ["read"],
                "system-health": ["read"],
                "performance": ["read"],
                "settings": ["read"]
            },
            UserRole.DEV: {
                "dashboard": ["read"],
                "system-health": ["read"],
                "performance": ["read"],
                "settings": ["read"]
            },
            UserRole.OTHER: {
                "dashboard": ["read"],
                "system-health": ["read"]
            }
        }
        
        user_permissions = role_permissions.get(user.role, {})
        resource_permissions = user_permissions.get(resource, [])
        
        return action in resource_permissions
    
    async def create_user_session(
        self, 
        db: AsyncSession, 
        user_id: int, 
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None
    ) -> UserSession:
        """Create a new user session"""
        session_id = secrets.token_urlsafe(32)
        expires_at = datetime.utcnow() + timedelta(hours=settings.SESSION_EXPIRE_HOURS)
        
        session = UserSession(
            session_id=session_id,
            user_id=user_id,
            ip_address=ip_address,
            user_agent=user_agent,
            expires_at=expires_at
        )
        
        db.add(session)
        await db.commit()
        await db.refresh(session)
        
        return session
    
    async def revoke_refresh_token(self, db: AsyncSession, token: str) -> bool:
        """Revoke a refresh token"""
        result = await db.execute(
            select(RefreshToken).where(RefreshToken.token == token)
        )
        refresh_token = result.scalar_one_or_none()
        
        if refresh_token:
            refresh_token.is_revoked = True
            await db.commit()
            return True
        
        return False

# Create auth service instance
auth_service = AuthService()

# Dependency functions
async def get_current_user(
    db: AsyncSession = Depends(get_db),
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> User:
    """Get current authenticated user dependency"""
    return await auth_service.get_current_user(db, credentials)

async def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    """Get current active user dependency"""
    return await auth_service.get_current_active_user(current_user)

def require_permission(resource: str, action: str):
    """Decorator to require specific permission"""
    def permission_checker(current_user: User = Depends(get_current_active_user)):
        if not auth_service.check_permission(current_user, resource, action):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions"
            )
        return current_user
    return permission_checker
