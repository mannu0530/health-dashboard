from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.services.auth import auth_service, get_current_active_user
from app.schemas.auth import (
    LoginRequest, LoginResponse, RefreshTokenRequest, RefreshTokenResponse,
    ChangePasswordRequest, ForgotPasswordRequest, ResetPasswordRequest,
    User, UserCreate, UserUpdate
)
from app.models.user import User as UserModel, UserRole
from app.schemas.auth import UserInDB
from sqlalchemy import select
from sqlalchemy.orm import selectinload

router = APIRouter()

@router.post("/login", response_model=LoginResponse)
async def login(
    login_data: LoginRequest,
    request: Request,
    db: AsyncSession = Depends(get_db)
) -> Any:
    """User login endpoint"""
    # Authenticate user
    user = await auth_service.authenticate_user(db, login_data.username, login_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=auth_service.access_token_expire_minutes)
    access_token = auth_service.create_access_token(
        data={"sub": user.username, "user_id": user.id, "role": user.role.value},
        expires_delta=access_token_expires
    )
    
    # Create refresh token
    refresh_token = auth_service.create_refresh_token(user.id)
    
    # Store refresh token in database
    from app.models.user import RefreshToken
    db_refresh_token = RefreshToken(
        token=refresh_token,
        user_id=user.id,
        expires_at=timedelta(days=auth_service.refresh_token_expire_days)
    )
    db.add(db_refresh_token)
    
    # Update last login
    user.last_login = timedelta()
    
    # Create user session
    await auth_service.create_user_session(
        db, 
        user.id, 
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent")
    )
    
    await db.commit()
    
    return LoginResponse(
        user=User.from_orm(user),
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=auth_service.access_token_expire_minutes * 60
    )

@router.post("/refresh", response_model=RefreshTokenResponse)
async def refresh_token(
    refresh_data: RefreshTokenRequest,
    db: AsyncSession = Depends(get_db)
) -> Any:
    """Refresh access token using refresh token"""
    # Verify refresh token
    result = await db.execute(
        select(RefreshToken).where(
            RefreshToken.token == refresh_data.refresh_token,
            RefreshToken.is_revoked == False
        )
    )
    db_refresh_token = result.scalar_one_or_none()
    
    if not db_refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    
    # Check if token is expired
    if db_refresh_token.expires_at < timedelta():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token expired"
        )
    
    # Get user
    result = await db.execute(select(UserModel).where(UserModel.id == db_refresh_token.user_id))
    user = result.scalar_one_or_none()
    
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive"
        )
    
    # Create new access token
    access_token_expires = timedelta(minutes=auth_service.access_token_expire_minutes)
    access_token = auth_service.create_access_token(
        data={"sub": user.username, "user_id": user.id, "role": user.role.value},
        expires_delta=access_token_expires
    )
    
    return RefreshTokenResponse(
        access_token=access_token,
        expires_in=auth_service.access_token_expire_minutes * 60
    )

@router.post("/logout")
async def logout(
    refresh_data: RefreshTokenRequest,
    db: AsyncSession = Depends(get_db)
) -> Any:
    """User logout endpoint"""
    # Revoke refresh token
    success = await auth_service.revoke_refresh_token(db, refresh_data.refresh_token)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid refresh token"
        )
    
    return {"message": "Successfully logged out"}

@router.get("/me", response_model=User)
async def get_current_user_info(
    current_user: UserModel = Depends(get_current_active_user)
) -> Any:
    """Get current user information"""
    return User.from_orm(current_user)

@router.post("/change-password")
async def change_password(
    password_data: ChangePasswordRequest,
    current_user: UserModel = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
) -> Any:
    """Change user password"""
    # Verify current password
    if not auth_service.verify_password(password_data.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect current password"
        )
    
    # Update password
    current_user.hashed_password = auth_service.get_password_hash(password_data.new_password)
    await db.commit()
    
    return {"message": "Password changed successfully"}

@router.post("/forgot-password")
async def forgot_password(
    forgot_data: ForgotPasswordRequest,
    db: AsyncSession = Depends(get_db)
) -> Any:
    """Send password reset email"""
    # Check if user exists
    result = await db.execute(select(UserModel).where(UserModel.email == forgot_data.email))
    user = result.scalar_one_or_none()
    
    if user:
        # In a real application, send password reset email here
        # For now, just return success message
        pass
    
    # Always return success to prevent email enumeration
    return {"message": "If the email exists, a password reset link has been sent"}

@router.post("/reset-password")
async def reset_password(
    reset_data: ResetPasswordRequest,
    db: AsyncSession = Depends(get_db)
) -> Any:
    """Reset password using reset token"""
    # In a real application, verify the reset token here
    # For now, just return success message
    return {"message": "Password reset successfully"}

# Admin endpoints for user management
@router.post("/users", response_model=User)
async def create_user(
    user_data: UserCreate,
    current_user: UserModel = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
) -> Any:
    """Create new user (admin only)"""
    # Check if current user has permission
    if not auth_service.check_permission(current_user, "users", "write"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Check if username already exists
    result = await db.execute(select(UserModel).where(UserModel.username == user_data.username))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already exists"
        )
    
    # Check if email already exists
    result = await db.execute(select(UserModel).where(UserModel.email == user_data.email))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already exists"
        )
    
    # Create new user
    hashed_password = auth_service.get_password_hash(user_data.password)
    db_user = UserModel(
        username=user_data.username,
        email=user_data.email,
        hashed_password=hashed_password,
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        role=user_data.role,
        is_active=user_data.is_active
    )
    
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    
    return User.from_orm(db_user)

@router.get("/users", response_model=list[User])
async def get_users(
    current_user: UserModel = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
) -> Any:
    """Get all users (admin only)"""
    # Check if current user has permission
    if not auth_service.check_permission(current_user, "users", "read"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    result = await db.execute(select(UserModel))
    users = result.scalars().all()
    
    return [User.from_orm(user) for user in users]

@router.get("/users/{user_id}", response_model=User)
async def get_user(
    user_id: int,
    current_user: UserModel = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
) -> Any:
    """Get user by ID (admin only)"""
    # Check if current user has permission
    if not auth_service.check_permission(current_user, "users", "read"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    result = await db.execute(select(UserModel).where(UserModel.id == user_id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return User.from_orm(user)

@router.put("/users/{user_id}", response_model=User)
async def update_user(
    user_id: int,
    user_data: UserUpdate,
    current_user: UserModel = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
) -> Any:
    """Update user (admin only)"""
    # Check if current user has permission
    if not auth_service.check_permission(current_user, "users", "write"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    result = await db.execute(select(UserModel).where(UserModel.id == user_id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Update user fields
    update_data = user_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)
    
    await db.commit()
    await db.refresh(user)
    
    return User.from_orm(user)

@router.delete("/users/{user_id}")
async def delete_user(
    user_id: int,
    current_user: UserModel = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
) -> Any:
    """Delete user (admin only)"""
    # Check if current user has permission
    if not auth_service.check_permission(current_user, "users", "write"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Prevent self-deletion
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete yourself"
        )
    
    result = await db.execute(select(UserModel).where(UserModel.id == user_id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Soft delete - mark as inactive
    user.is_active = False
    await db.commit()
    
    return {"message": "User deleted successfully"}
